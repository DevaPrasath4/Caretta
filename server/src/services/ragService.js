// server/services/ragService.js – Vector DB search + transcript logging

const KnowledgeChunk = require('../models/KnowledgeChunk');
const Transcript = require('../models/Transcript');
const Suggestion = require('../models/Suggestion');

async function getEmbedding(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const fetcher = global.fetch || (await import('node-fetch')).default;
  const requestOptions = (body) => ({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const attempts = [
    {
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
      body: {
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text }] },
        taskType: 'RETRIEVAL_DOCUMENT',
      },
    },
    {
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
      body: {
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text }] },
      },
    },
  ];

  let lastError = 'no embedding returned';

  for (const attempt of attempts) {
    const response = await fetcher(attempt.url, requestOptions(attempt.body));
    const data = await response.json();

    if (!response.ok) {
      lastError = data.error?.message || data.error?.errors?.[0]?.message || response.statusText;
      continue; // try next attempt instead of throwing immediately
    }

    const embedding = data.embedding?.values
      || data.output?.[0]?.embedding?.values
      || data?.[0]?.embedding?.values
      || data.results?.[0]?.embedding?.values;

    if (Array.isArray(embedding) && embedding.length > 0) {
      return embedding;
    }
  }

  throw new Error(`Gemini embedding error: ${lastError}`);
}

async function addCustomChunk({ text, source = 'user-text', category = 'Custom' }) {
  const embedding = await getEmbedding(text);
  const entryId = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return KnowledgeChunk.create({
    entryId,
    category,
    question: '',
    answer: text,
    keywords: [],
    tags: [],
    source,
    embedding,
  });
}

async function seedKnowledgeBase() {
  const builtInCount = await KnowledgeChunk.countDocuments({ source: 'built-in' });
  if (builtInCount > 0) {
    console.log(`Built-in knowledge base already seeded (${builtInCount} entries)`);
    return builtInCount;
  }

  const KB = require('../data/knowledgeBase');
  let inserted = 0;

  for (const entry of KB) {
    try {
      const embedding = await getEmbedding(`${entry.question} ${entry.answer}`);
      await KnowledgeChunk.create({
        entryId : entry.id,
        category: entry.category,
        question: entry.question,
        answer  : entry.answer,
        keywords: entry.keywords,
        tags    : entry.tags,
        source  : 'built-in',
        embedding,
      });
      inserted++;
    } catch (err) {
      console.warn('seedKnowledgeBase error for', entry.id, err.message);
    }
  }

  console.log(`seedKnowledgeBase inserted ${inserted}/${KB.length} entries`);
  return inserted;
}

/**
 * Search the knowledge base for relevant chunks.
 * In production: use Pinecone / Weaviate / FAISS for semantic search.
 * This stub returns dummy product knowledge for demo purposes.
 */
async function searchKnowledgeBase(query) {
  const q = query.toLowerCase();
  const kb = [
    { keywords: ['encrypt','aes','tls','security','compliance'],     text: 'We use AES-256 at rest, TLS 1.3 in transit. SOC 2 Type II and ISO 27001 certified.' },
    { keywords: ['on-premise','on premise','deploy','docker','k8s'], text: 'We support on-premise deployment via Docker/Kubernetes. Full setup docs provided.' },
    { keywords: ['salesforce','hubspot','crm','integration'],        text: 'Native Salesforce AppExchange integration. One-click install, bi-directional sync.' },
    { keywords: ['price','pricing','cost','contract','annual'],      text: 'Per-seat pricing with volume discounts. Monthly or annual (20% savings) plans available.' },
    { keywords: ['uptime','sla','downtime','reliability'],           text: '99.9% uptime SLA standard, 99.99% for enterprise. Real-time status page available.' },
    { keywords: ['competitor','compare','vs','alternative'],         text: 'Sub-800ms suggestion latency. RAG-grounded answers eliminate hallucinations.' },
  ];

  return kb.filter(entry => entry.keywords.some(kw => q.includes(kw))).map(e => e.text);
}

/**
 * Persist transcript message + suggestion to MongoDB.
 */
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

module.exports = { searchKnowledgeBase, logTranscript, getEmbedding, addCustomChunk, seedKnowledgeBase };