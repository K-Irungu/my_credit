import mongoose, { Schema, Document } from "mongoose";

export interface FeedbackDocument extends Document {
  description: string;
  issueId: mongoose.Types.ObjectId; // Reference to Issue
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<FeedbackDocument>(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    issueId: {
      type: Schema.Types.ObjectId,
      ref: "Issue", // Link to Issue model
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

export default mongoose.models.Feedback ||
  mongoose.model<FeedbackDocument>("Feedback", feedbackSchema);
