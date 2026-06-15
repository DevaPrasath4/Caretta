const express = require("express");
const { getAISuggestion } = require("../services/llmService");
const { textToSpeech } = require("../services/ttsService");

const router = express.Router();

// POST /api/ai/suggest
router.post("/suggest", async (req, res) => {
  try {
    console.log("✅ /suggest route hit");
    console.log("REQ BODY:", req.body);
    const { sessionId, prospectText } = req.body;

    if (!prospectText) {
      return res.status(400).json({ error: "prospectText is required" });
    }

    const result = await getAISuggestion(sessionId || "demo-session", prospectText);

    if (!result) {
      return res.json({ isQuestion: false });
    }

    // Generate TTS audio if answer exists and API key is set
    if (result.answer && process.env.ELEVEN_LABS_API_KEY) {
      try {
        const audioBuffer = await textToSpeech(result.answer);
        const audioBase64 = audioBuffer.toString('base64');
        result.audioBase64 = audioBase64;
      } catch (ttsErr) {
        console.warn('TTS generation failed:', ttsErr.message);
        // Continue without audio
      }
    }

    res.json(result);
  } catch (err) {
    console.error("AI Suggest Error:", err.message);
    res.status(500).json({ error: "AI suggestion failed" });
  }
});

module.exports = router;