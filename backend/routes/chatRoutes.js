const express = require('express');
const router = express.Router();
const Chat = require('../models/chat');

// Get all chats
router.get('/', async (req, res) => {
  try {
    const chats = await Chat.find().populate('users messages.sender');
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single chat by ID
router.get('/:id', async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id).populate('users messages.sender');
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new chat
router.post('/', async (req, res) => {
  try {
    const chat = new Chat(req.body);
    await chat.save();
    res.status(201).json(chat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add a message to a chat
router.post('/:id/messages', async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    chat.messages.push({
      sender: req.body.sender,
      message: req.body.message,
      timestamp: new Date()
    });

    await chat.save();
    res.json(chat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a chat
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Chat.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Chat not found' });
    res.json({ message: 'Chat deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
