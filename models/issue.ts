import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from 'uuid'; // Import the uuid library

export interface IssueDocument extends Document {
  implicatedPersonel: {
    firstName: string;
    lastName: string;
    companyLocation: string;
    rolePosition: string;
    phoneNumber: string;
  };
  malpractice: {
    type: string;
    location: string;
    description: string;
    isOngoing: string;
  };
  reporter: mongoose.Types.ObjectId;
  status: "submitted" | "investigating" | "responded" | "resolved";
  source: "ussd" | "web";
  filename?: string; // Optional field for the name of the media file
  REF: string; // The unique reference field
  createdAt: Date;
  updatedAt: Date;
}

const issueSchema = new Schema<IssueDocument>(
  {
    implicatedPersonel: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      companyLocation: { type: String, required: true },
      rolePosition: { type: String, required: true },
      phoneNumber: { type: String, required: true },
    },
    malpractice: {
      type: { type: String, required: true },
      location: { type: String, required: true },
      description: { type: String, required: true },
      isOngoing: { type: String, required: true },
    },
    reporter: {
      type: Schema.Types.ObjectId,
      ref: "Reporter",
      required: true,
    },
    status: {
      type: String,
      enum: ["submitted", "investigating", "responded", "resolved"],
      default: "submitted",
    },
    source: {
      type: String,
      enum: ["ussd", "web"],
      required: true,
    },
    filename: {
      type: String,
      required: false,
    },
    REF: { // The new REF field
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Issue ||
  mongoose.model<IssueDocument>("Issue", issueSchema);
