import mongoose, { Schema, Document } from "mongoose";

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
  status: "pending" | "investigating" | "responded" | "resolved";
  source: "ussd" | "web";
  filename?: string; // Optional field for the name of the media file
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
      enum: ["pending", "investigating", "responded", "resolved"],
      default: "pending",
    },
    source: {
      type: String,
      enum: ["ussd", "web"],
      required: true,
    },
    filename: {
      type: String,
      required: false, // Optional: allow issue submission without a file
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Issue ||
  mongoose.model<IssueDocument>("Issue", issueSchema);
