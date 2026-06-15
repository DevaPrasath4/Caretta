// server/middleware/authMiddleware.js – JWT protection

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authorized. No token provided.' });
  }

  try {
    const token   = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ error: 'User not found.' });
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid or expired.' });
  }
}

module.exports = { protect };