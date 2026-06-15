// server/routes/callRoutes.js

const express = require('express');
const router  = express.Router();
const { startCall, endCall, getCalls, getCallById } = require('../controllers/callController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // all call routes require auth

router.get ('/',        getCalls);
router.post('/start',   startCall);
router.put ('/:id/end', endCall);
router.get ('/:id',     getCallById);

module.exports = router;