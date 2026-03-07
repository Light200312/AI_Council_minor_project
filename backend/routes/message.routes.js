import express from "express";
import Message from "../models/messages.js";
import authGuard from "../middleware/auth.js";

const router = express.Router();

router.get("/", authGuard, async (req, res) => {
  try {
    const { sessionId, topic } = req.query || {};
    const filter = {};
    if (sessionId) filter.sessionId = String(sessionId);
    if (topic) filter.topic = String(topic);

    const messages = await Message.find(filter).sort({ timestamp: 1 }).lean();
    return res.json({ messages });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch messages.", error: error.message });
  }
});

router.post("/", authGuard, async (req, res) => {
  try {
    const { sessionId, topic, speakerId, speakerName, speakerInitials, isUser, text, timestamp } = req.body || {};
    if (!speakerId || !speakerName || !speakerInitials || typeof isUser !== "boolean" || !text) {
      return res.status(400).json({ message: "Invalid message payload." });
    }
    if (!sessionId || !topic) {
      return res.status(400).json({ message: "sessionId and topic are required." });
    }

    const created = await Message.create({
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sessionId,
      topic,
      speakerId,
      speakerName,
      speakerInitials,
      isUser,
      text,
      timestamp: timestamp || Date.now(),
    });

    return res.status(201).json({ message: created });
  } catch (error) {
    return res.status(500).json({ message: "Failed to save message.", error: error.message });
  }
});

export default router;
