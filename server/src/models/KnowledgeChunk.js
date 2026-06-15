// server/models/KnowledgeChunk.js
// Stores embedded knowledge base entries for semantic RAG search

const mongoose = require('mongoose');

const KnowledgeChunkSchema = new mongoose.Schema({
  entryId   : { type: String, required: true, unique: true, index: true },
  category  : { type: String, default: 'General' },
  question  : { type: String, default: '' },
  answer    : { type: String, required: true },
  keywords  : [String],
  tags      : [String],
  source    : { type: String, default: 'built-in' },   // 'built-in' | 'user-upload'
  embedding : { type: [Number], default: [] },          // Gemini text-embedding-004 vector (768-dim)
}, { timestamps: true });

module.exports = mongoose.model('KnowledgeChunk', KnowledgeChunkSchema);