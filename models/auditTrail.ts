import mongoose, { Schema, Document } from "mongoose";

export interface AuditTrailDocument extends Document {
  browser: string;
  ipAddress: string;
  computerName: string;
  activity: string;
  endpoint: string;
  timestamp: Date;
  dataInTransit?: any;
  deviceId: string;
  userDetails: {
    userId: mongoose.Types.ObjectId;
    model: "Admin" | "Reporter";
    name?: string;
    role?: string;
  };
}

const auditTrailSchema = new Schema<AuditTrailDocument>(
  {
    browser: { type: String, required: true },
    ipAddress: { type: String, required: true },
    computerName: { type: String, required: true },
    activity: { type: String, required: true, trim: true },
    endpoint: { type: String, required: true, trim: true },
    timestamp: { type: Date, default: Date.now },
    dataInTransit: { type: Schema.Types.Mixed, required: false },
    deviceId: {type: String, required: true},

    userDetails: {
      userId: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: "userDetails.model", // Dynamic reference
      },
      model: {
        type: String,
        required: true,
        enum: ["Admin", "Reporter"], // Only allow Admin or Reporter
      },
      name: { type: String, required: false },
      role: { type: String, required: false },
    },
  },
  { timestamps: false }
);

export default mongoose.models.AuditTrail ||
  mongoose.model<AuditTrailDocument>("AuditTrail", auditTrailSchema);
