const express = require('express');
const router = express.Router();
const { handleUserMessage } = require('../controllers/chatbotController');
const { optionalAuth } = require('../middleware/authMiddleware');

// POST /api/chatbot/message (Public or Authenticated)
router.post('/message', optionalAuth, handleUserMessage);

module.exports = router;
