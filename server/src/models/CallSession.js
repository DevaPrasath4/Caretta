// server/models/CallSession.js

const mongoose = require('mongoose');

const CallSessionSchema = new mongoose.Schema({
  userId      : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId   : { type: String, required: true, unique: true },
  prospect    : { type: String, default: 'Unknown Prospect' },
  startedAt   : { type: Date, default: Date.now },
  endedAt     : { type: Date },
  durationSecs: { type: Number, default: 0 },
  status      : { type: String, enum: ['active','ended'], default: 'active' },
  questionCount : { type: Number, default: 0 },
  avgConfidence : { type: Number, default: 0 },
  tags        : [String],
}, { timestamps: true });

module.exports = mongoose.model('CallSession', CallSessionSchema);