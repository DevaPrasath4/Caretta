// server/services/ragService.js – Real RAG using Gemini embeddings + cosine similarity

const Transcript  = require('../models/Transcript');
const Suggestion  = require('../models/Suggestion');
const KnowledgeChunk = require('../models/KnowledgeChunk');
const KB          = require('../data/knowledgeBase');

// ── Embedding via Gemini ──────────────────────────────────────────────────────

async function getEmbedding(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: { parts: [{ text }] },
        taskType: 'RETRIEVAL_DOCUMENT',
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Gemini embedding error: ${err.error?.message || response.status}`);
  }

  const data = await response.json();
  return data.embedding?.values || [];
}

// ── Cosine similarity ─────────────────────────────────────────────────────────

function cosineSimilarity(a, b) {
  if (!a.length || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10);
}

// ── Keyword fallback (instant, no API call) ───────────────────────────────────

function keywordSearch(query, topK = 3) {
  const q = query.toLowerCase();
  const scored = KB.map(entry => {
    const kwHits = entry.keywords.filter(kw => q.includes(kw)).length;
    const qWords = q.split(/\s+/).filter(w => w.length > 3);
    const textHits = qWords.filter(w =>
      entry.question.toLowerCase().includes(w) ||
      entry.answer.toLowerCase().includes(w)
    ).length;
    return { entry, score: kwHits * 2 + textHits };
  });
  return scored
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(x => ({ text: x.entry.answer, question: x.entry.question, id: x.entry.id, score: x.score }));
}

// ── Seed the DB with embeddings (run once on server start) ────────────────────

let seeded = false;

async function seedKnowledgeBase() {
  if (seeded) return;
  seeded = true;

  try {
    const existing = await KnowledgeChunk.countDocuments();
    if (existing >= KB.length) {
      console.log(`✅ Knowledge base already seeded (${existing} chunks)`);
      return;
    }

    console.log(`🌱 Seeding knowledge base with ${KB.length} entries...`);

    const BATCH = 5;
    let inserted = 0;

    for (let i = 0; i < KB.length; i += BATCH) {
      const batch = KB.slice(i, i + BATCH);
      await Promise.all(batch.map(async (entry) => {
        try {
          const exists = await KnowledgeChunk.findOne({ entryId: entry.id });
          if (exists) return;

          const textToEmbed = `${entry.question} ${entry.answer}`;
          const embedding   = await getEmbedding(textToEmbed);

          await KnowledgeChunk.create({
            entryId   : entry.id,
            category  : entry.category,
            question  : entry.question,
            answer    : entry.answer,
            keywords  : entry.keywords,
            tags      : entry.tags,
            embedding,
          });
          inserted++;
        } catch (err) {
          console.warn(`⚠️  Could not embed entry ${entry.id}:`, err.message);
        }
      }));

      if (i + BATCH < KB.length) await new Promise(r => setTimeout(r, 500));
    }

    console.log(`✅ Knowledge base seeded: ${inserted} new chunks embedded`);
  } catch (err) {
    console.error('❌ seedKnowledgeBase error:', err.message);
  }
}

// ── Main search function ──────────────────────────────────────────────────────

async function searchKnowledgeBase(query, topK = 3) {
  try {
    const chunks = await KnowledgeChunk.find(
      { embedding: { $exists: true, $not: { $size: 0 } } },
      { answer: 1, question: 1, entryId: 1, embedding: 1 }
    ).lean();

    if (chunks.length > 0) {
      const queryEmb = await getEmbedding(query);

      const scored = chunks.map(chunk => ({
        text    : chunk.answer,
        question: chunk.question,
        id      : chunk.entryId,
        score   : cosineSimilarity(queryEmb, chunk.embedding),
      }));

      const results = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .filter(r => r.score > 0.3);

      if (results.length > 0) {
        console.log(`🔍 RAG (semantic): ${results.length} chunks, top score ${results[0].score.toFixed(3)}`);
        return results.map(r => r.text);
      }
    }

    console.log('🔍 RAG (keyword fallback)');
    return keywordSearch(query, topK).map(r => r.text);

  } catch (err) {
    console.warn('⚠️  Semantic search failed, keyword fallback:', err.message);
    return keywordSearch(query, topK).map(r => r.text);
  }
}

// ── Add a custom chunk (user-uploaded content) ────────────────────────────────

async function addCustomChunk({ text, source = 'user-upload' }) {
  try {
    const embedding = await getEmbedding(text);
    return await KnowledgeChunk.create({
      entryId  : `custom-${Date.now()}`,
      category : 'Custom',
      question : '',
      answer   : text,
      keywords : [],
      tags     : ['tech'],
      source,
      embedding,
    });
  } catch (err) {
    console.error('❌ addCustomChunk error:', err.message);
    throw err;
  }
}

// ── Persist transcript + suggestion ──────────────────────────────────────────

async function logTranscript(sessionId, text, suggestion) {
  try {
    await Transcript.create({ sessionId, who: 'prospect', text, flagged: true });
    if (suggestion) {
      await Suggestion.create({
        sessionId,
        question  : text,
        answer    : suggestion.answer,
        note      : suggestion.note,
        tag       : suggestion.tag,
        tagLabel  : suggestion.tagLabel,
        confidence: suggestion.confidence,
        followups : suggestion.followups,
      });
    }
  } catch (err) {
    console.error('logTranscript error:', err.message);
  }
}

module.exports = { searchKnowledgeBase, logTranscript, seedKnowledgeBase, addCustomChunk };