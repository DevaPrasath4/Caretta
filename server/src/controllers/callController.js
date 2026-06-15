// server/controllers/callController.js

const { v4: uuidv4 } = require('uuid');
const CallSession    = require('../models/CallSession');

// POST /api/calls/start
async function startCall(req, res, next) {
  try {
    const { prospect } = req.body;
    const session = await CallSession.create({
      userId   : req.user.id,
      sessionId: uuidv4(),
      prospect : prospect || 'Unknown Prospect',
    });
    res.status(201).json(session);
  } catch (err) { next(err); }
}

// PUT /api/calls/:id/end
async function endCall(req, res, next) {
  try {
    const session = await CallSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    if (session.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden.' });

    session.status      = 'ended';
    session.endedAt     = new Date();
    session.durationSecs = Math.round((session.endedAt - session.startedAt) / 1000);
    await session.save();
    res.json(session);
  } catch (err) { next(err); }
}

// GET /api/calls
async function getCalls(req, res, next) {
  try {
    const calls = await CallSession.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
    res.json(calls);
  } catch (err) { next(err); }
}

// GET /api/calls/:id
async function getCallById(req, res, next) {
  try {
    const session = await CallSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    if (session.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden.' });
    res.json(session);
  } catch (err) { next(err); }
}

module.exports = { startCall, endCall, getCalls, getCallById };