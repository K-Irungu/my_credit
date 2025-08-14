// models/session.ts
import mongoose, { Schema, Types } from "mongoose";

const SessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
  sessionHash: { type: String, required: true, unique: true, index: true }, // sha256(sessionId)
  deviceId: { type: String, default: null },
  userAgent: { type: String, default: "" },
  ipAddress: { type: String, default: "" },
  createdAt: { type: Date, default: () => new Date() },
  // TTL index: MongoDB will delete rows automatically when expiresAt < now
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  revokedAt: { type: Date, default: null }
});

export default mongoose.models.Session || mongoose.model("Session", SessionSchema);
