import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailLog extends Document {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  messageId: string;
  createdAt: Date;
}

const EmailLogSchema = new Schema<IEmailLog>(
  {
    to: { type: String, required: true },
    subject: { type: String, required: true },
    text: { type: String },
    html: { type: String },
    messageId: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } } // only store createdAt
);

export default mongoose.models.EmailLog ||
  mongoose.model<IEmailLog>('EmailLog', EmailLogSchema);
