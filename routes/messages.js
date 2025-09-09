const express = require('express');
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

const router = express.Router();

// Send message
router.post('/compose', auth, async (req, res) => {
  const { to, subject, body } = req.body;

  try {
    // Look up recipient by email
    const recipient = await User.findOne({ email: to });
    if (!recipient) return res.status(404).json({ msg: "Recipient not found" });

    const msg = new Message({
      from: req.user,
      to: recipient._id, // store user ID in DB
      subject,
      body
    });

    await msg.save();
    res.json(msg);
  } catch (err) {
    res.status(500).json({ msg: "Error sending message", error: err.message });
  }
});

// Inbox
router.get('/inbox', auth, async (req, res) => {
  try {
    const msgs = await Message.find({ to: req.user }).populate('from', 'name email');
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching inbox", error: err.message });
  }
});

module.exports = router;
