// server/models/Suggestion.js

const mongoose = require('mongoose');

const SuggestionSchema = new mongoose.Schema({
  sessionId  : { type: String, required: true, index: true },
  question   : { type: String, required: true },   // the prospect's question
  answer     : { type: String, required: true },   // AI-generated answer
  note       : { type: String, default: '' },      // coaching tip
  tag        : { type: String, default: 'tech' },  // tech | obj | danger | tip
  tagLabel   : { type: String, default: 'Technical' },
  confidence : { type: Number, default: 80 },
  followups  : [String],
  docRef     : { type: String, default: '' },
  ts         : { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Suggestion', SuggestionSchema);