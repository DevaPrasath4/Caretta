// server/models/Transcript.js

const mongoose = require('mongoose');

const TranscriptSchema = new mongoose.Schema({
  sessionId : { type: String, required: true, index: true },
  who       : { type: String, enum: ['prospect','rep','system'], required: true },
  text      : { type: String, required: true },
  ts        : { type: Date, default: Date.now },
  flagged   : { type: Boolean, default: false }, // true if a technical question was detected
}, { timestamps: true });

module.exports = mongoose.model('Transcript', TranscriptSchema);