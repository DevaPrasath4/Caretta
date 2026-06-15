/**
 * test_rag.js — Run this to verify your RAG pipeline works
 * Usage: node test_rag.js
 * 
 * Tests:
 * 1. Gemini embedding API connection
 * 2. Cosine similarity math
 * 3. Keyword fallback search
 * 4. Full semantic search with 5 sample queries
 */

require('dotenv').config();

const KB = require('./src/data/knowledgeBase');

// ── Cosine similarity (copy from ragService) ──────────────────────────────────
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10);
}

async function getEmbedding(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const fetcher = global.fetch || (await import('node-fetch')).default;
  const requestOptions = (url, body) => ({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`;
  const body = {
    model: 'models/gemini-embedding-001',
    content: { parts: [{ text }] },
    taskType: 'RETRIEVAL_DOCUMENT',
  };

  const response = await fetcher(url, requestOptions(url, body));
  const data = await response.json();

  if (!response.ok) {
    const message = data.error?.message || data.error?.errors?.[0]?.message || response.statusText;
    throw new Error(`Gemini embedding error: ${message}`);
  }

  const embedding = data.embedding?.values;
  if (Array.isArray(embedding) && embedding.length > 0) {
    return embedding;
  }

  throw new Error('Gemini embedding error: no embedding returned');
}

// ── Keyword search (copy from ragService) ─────────────────────────────────────
function keywordSearch(query) {
  const q = query.toLowerCase();
  return KB.map(e => ({
    entry: e,
    score: e.keywords.filter(kw => q.includes(kw)).length * 2 +
           q.split(/\s+/).filter(w => w.length > 3 &&
             (e.question.toLowerCase().includes(w) || e.answer.toLowerCase().includes(w))).length
  }))
  .filter(x => x.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 3);
}

// ── Test queries ───────────────────────────────────────────────────────────────
const TEST_QUERIES = [
  { q: 'How do you keep our data safe from hackers?',       expect: 'sec-encryption' },
  { q: 'What does it cost for a team of 50 people?',        expect: 'price-model' },
  { q: 'Can we connect to Salesforce?',                     expect: 'int-salesforce' },
  { q: 'Do you have 99.9% uptime?',                         expect: 'infra-uptime' },
  { q: 'What happens to our data when we cancel?',          expect: 'data-delete' },
];

async function runTests() {
  console.log('\n🧪 CARETTA RAG TEST SUITE\n');
  console.log(`📚 Knowledge base: ${KB.length} entries\n`);

  // ── Test 1: Keyword search ────────────────────────────────────────────────
  console.log('─── TEST 1: Keyword Search ───────────────────────────────────');
  let kwPassed = 0;
  for (const { q, expect } of TEST_QUERIES) {
    const results = keywordSearch(q);
    const found   = results.some(r => r.entry.id === expect);
    console.log(`  ${found ? '✅' : '❌'} "${q}"`);
    if (results.length) console.log(`     → ${results[0].entry.id} (score ${results[0].score})`);
    if (found) kwPassed++;
  }
  console.log(`\n  Keyword accuracy: ${kwPassed}/${TEST_QUERIES.length}\n`);

  // ── Test 2: Embedding API ─────────────────────────────────────────────────
  console.log('─── TEST 2: Gemini Embedding API ─────────────────────────────');
  if (!process.env.GEMINI_API_KEY) {
    console.log('  ⚠️  GEMINI_API_KEY not set — skipping semantic tests\n');
    return;
  }

  try {
    const testEmb = await getEmbedding('test connection');
    console.log(`  ✅ Embedding API works — vector dim: ${testEmb.length}\n`);
  } catch (err) {
    console.log(`  ❌ Embedding API failed: ${err.message}\n`);
    return;
  }

  // ── Test 3: Full semantic search ──────────────────────────────────────────
  console.log('─── TEST 3: Semantic Search ──────────────────────────────────');
  
  // Pre-embed a few KB entries for comparison
  const samplesToEmbed = TEST_QUERIES.map(t => t.expect);
  const kbEmbeddings = {};
  
  console.log('  Embedding sample KB entries...');
  for (const id of samplesToEmbed) {
    const entry = KB.find(e => e.id === id);
    if (entry) {
      kbEmbeddings[id] = await getEmbedding(`${entry.question} ${entry.answer}`);
    }
  }

  let semPassed = 0;
  for (const { q, expect } of TEST_QUERIES) {
    const queryEmb = await getEmbedding(q);
    
    const scores = Object.entries(kbEmbeddings).map(([id, emb]) => ({
      id, score: cosineSimilarity(queryEmb, emb)
    }));
    
    scores.sort((a, b) => b.score - a.score);
    const top = scores[0];
    const found = top?.id === expect;
    
    console.log(`  ${found ? '✅' : '❌'} "${q}"`);
    console.log(`     → top match: ${top?.id} (similarity ${top?.score.toFixed(4)})`);
    if (found) semPassed++;
  }

  console.log(`\n  Semantic accuracy: ${semPassed}/${TEST_QUERIES.length}`);
  console.log('\n✅ RAG test complete!\n');
}

runTests().catch(console.error);