import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, trim: true },
  sessionId: { type: String, required: true, trim: true, index: true },
  topic: { type: String, required: true, trim: true, index: true },
  speakerId: { type: String, required: true, trim: true },
  speakerName: { type: String, required: true, trim: true },
  speakerInitials: { type: String, required: true, trim: true },
  isUser: { type: Boolean, required: true },
  text: { type: String, required: true, trim: true },
  timestamp: { type: Number, required: true, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

export default Message;
