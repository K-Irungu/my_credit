import mongoose, { Schema, Document } from "mongoose";

export interface AuditTrailDocument extends Document {
  browser: string;
  ipAddress: string;
  deviceId: string;
  activity: string;
  endpoint: string;
  userDetails: {
    userId: mongoose.Types.ObjectId;
    model: "Admin" | "Reporter";
    name?: string;
    role?: string;
  };
  dataInTransit?: any;

  timestamp: Date;
}

const auditTrailSchema = new Schema<AuditTrailDocument>(
  {
    browser: { type: String, required: true },
    ipAddress: { type: String, required: true },
    deviceId: { type: String, required: true },
    activity: { type: String, required: true, trim: true },
    endpoint: { type: String, required: true, trim: true },
    userDetails: {
      userId: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: "userDetails.model", 
      },
      model: {
        type: String,
        required: true,
        enum: ["Admin", "Reporter"], 
      },
      timestamp: { type: Date, default: Date.now },
      name: { type: String, required: false },
      role: { type: String, required: false },
    },
    dataInTransit: { type: Schema.Types.Mixed, required: false },
  },
  { timestamps: false }
);

export default mongoose.models.AuditTrail ||
  mongoose.model<AuditTrailDocument>("AuditTrail", auditTrailSchema);
