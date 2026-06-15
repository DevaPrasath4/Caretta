// server/controllers/transcriptController.js

const Transcript = require('../models/Transcript');
const Suggestion = require('../models/Suggestion');

// GET /api/transcripts/:sessionId
async function getTranscript(req, res, next) {
  try {
    const messages = await Transcript.find({ sessionId: req.params.sessionId }).sort({ ts: 1 });
    res.json(messages);
  } catch (err) { next(err); }
}

// GET /api/transcripts/:sessionId/suggestions
async function getSuggestions(req, res, next) {
  try {
    const suggestions = await Suggestion.find({ sessionId: req.params.sessionId }).sort({ ts: 1 });
    res.json(suggestions);
  } catch (err) { next(err); }
}

module.exports = { getTranscript, getSuggestions };