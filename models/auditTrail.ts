import mongoose, { Schema, Document } from "mongoose";

export interface AuditTrailDocument extends Document {
  browser: string;
  ipAddress: string;
  deviceId: string | null;
  activity: string;
  endpoint: string;
  userDetails: {
    userId?: mongoose.Types.ObjectId | null; // optional for failed logins
    model: "Admin" | "Reporter" | "Unknown"; // added Unknown for failed cases
    name?: string | null;
    role?: string | null;
  };
  dataInTransit?: any;

  timestamp: Date;
}

const auditTrailSchema = new Schema<AuditTrailDocument>(
  {
    browser: { type: String, required: true },
    ipAddress: { type: String, required: true },
    deviceId: { type: String , required: false },
    activity: { type: String, required: true, trim: true },
    endpoint: { type: String, required: true, trim: true },
    userDetails: {
      userId: {
        type: Schema.Types.ObjectId,
        refPath: "userDetails.model", //mongoose will look at userDetails.model to know which model to reference for the userId
        required: false,
      },
      model: {
        type: String,
        required: true,
        enum: ["Admin", "Reporter", "Unknown"], 
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
