// server/routes/transcriptRoutes.js

const express = require('express');
const router  = express.Router();
const { getTranscript, getSuggestions } = require('../controllers/transcriptController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/:sessionId',             getTranscript);
router.get('/:sessionId/suggestions', getSuggestions);

module.exports = router;