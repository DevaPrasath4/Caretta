// server/routes/kbRoutes.js – Knowledge base management API

const express  = require('express');
const multer   = require('multer');
const KnowledgeChunk = require('../models/KnowledgeChunk');
const { addCustomChunk, seedKnowledgeBase } = require('../services/ragService');

const router  = express.Router();
const upload  = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// ── GET /api/kb  — list all chunks ────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const chunks = await KnowledgeChunk.find(
      {},
      { entryId: 1, category: 1, question: 1, answer: 1, source: 1, createdAt: 1 }
    ).sort({ createdAt: 1 }).lean();
    res.json({ count: chunks.length, chunks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/kb/stats ─────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const total    = await KnowledgeChunk.countDocuments();
    const embedded = await KnowledgeChunk.countDocuments({ 'embedding.0': { $exists: true } });
    const bySource = await KnowledgeChunk.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);
    const byCategory = await KnowledgeChunk.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    res.json({ total, embedded, bySource, byCategory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/kb/text  — add raw text snippet ─────────────────────────────────
router.post('/text', async (req, res) => {
  try {
    const { text, category = 'Custom' } = req.body;
    if (!text || text.trim().length < 10) {
      return res.status(400).json({ error: 'text must be at least 10 characters' });
    }

    // Split into chunks of ~500 chars at sentence boundaries
    const chunks = splitIntoChunks(text, 500);
    const results = [];

    for (const chunk of chunks) {
      const doc = await addCustomChunk({ text: chunk, source: 'user-text' });
      results.push({ id: doc.entryId, preview: chunk.slice(0, 80) + '...' });
    }

    res.json({ added: results.length, chunks: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/kb/upload  — upload a .txt or .md file ─────────────────────────
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const ext = req.file.originalname.split('.').pop().toLowerCase();
    if (!['txt', 'md', 'csv'].includes(ext)) {
      return res.status(400).json({ error: 'Only .txt, .md, and .csv files supported' });
    }

    const rawText = req.file.buffer.toString('utf8');
    const chunks  = splitIntoChunks(rawText, 500);
    const results = [];

    for (const chunk of chunks) {
      if (chunk.trim().length < 20) continue;
      const doc = await addCustomChunk({
        text  : chunk,
        source: `upload:${req.file.originalname}`,
      });
      results.push({ id: doc.entryId, preview: chunk.slice(0, 80) + '...' });
    }

    res.json({
      filename: req.file.originalname,
      added   : results.length,
      chunks  : results,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/kb/seed  — re-run the built-in seed ────────────────────────────
router.post('/seed', async (req, res) => {
  try {
    const seeded = await seedKnowledgeBase();
    res.json({ seeded });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/kb/:id ────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await KnowledgeChunk.deleteOne({ entryId: req.params.id });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Helper: split text into overlapping chunks ────────────────────────────────
function splitIntoChunks(text, maxLen = 500) {
  const sentences = text
    .replace(/\r\n/g, '\n')
    .split(/(?<=[.!?\n])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const chunks = [];
  let current  = '';

  for (const sentence of sentences) {
    if ((current + ' ' + sentence).length > maxLen && current.length > 0) {
      chunks.push(current.trim());
      // 20% overlap
      const words  = current.split(' ');
      const overlap = words.slice(-Math.floor(words.length * 0.2)).join(' ');
      current = overlap + ' ' + sentence;
    } else {
      current = current ? current + ' ' + sentence : sentence;
    }
  }

  if (current.trim().length > 0) chunks.push(current.trim());
  return chunks;
}

module.exports = router;