import Message from "./message.model.js";
import { generateMessageId, sanitizeStringArray } from "../../shared/helpers.js";

export async function listMessages(req, res) {
  try {
    const { sessionId, topic } = req.query || {};
    const filter = {};
    if (sessionId) filter.sessionId = String(sessionId);
    if (topic) filter.topic = String(topic);
    const messages = await Message.find(filter).sort({ timestamp: 1 }).lean();
    return res.json({ messages });
  } catch (error) { console.error("Message list failed:", error); return res.status(500).json({ message: "Failed to fetch messages.", error: error.message }); }
}

export async function createMessage(req, res) {
  try {
    const { sessionId, topic, sessionParticipantIds = [], sessionParticipants = [], speakerId, speakerName, speakerInitials, isUser, text, timestamp } = req.body || {};
    if (!speakerId || !speakerName || !speakerInitials || typeof isUser !== "boolean" || !text) return res.status(400).json({ message: "Invalid message payload." });
    if (!sessionId || !topic) return res.status(400).json({ message: "sessionId and topic are required." });
    const created = await Message.create({
      id: generateMessageId(), sessionId, topic,
      sessionParticipantIds: sanitizeStringArray(sessionParticipantIds),
      sessionParticipants: Array.isArray(sessionParticipants) ? sessionParticipants.map((p) => ({ id: String(p?.id || "").trim(), name: String(p?.name || "").trim(), role: String(p?.role || "").trim(), avatarInitials: String(p?.avatarInitials || "").trim() })).filter((p) => p.id && p.name) : [],
      speakerId, speakerName, speakerInitials, isUser, text, timestamp: timestamp || Date.now(),
    });
    return res.status(201).json({ message: created });
  } catch (error) { console.error("Message create failed:", error); return res.status(500).json({ message: "Failed to save message.", error: error.message }); }
}
