import mongoose, { Document, Schema } from "mongoose";

export interface IReporter extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  company?: string;
  role?: string;
  requiresFeedback: boolean;
  REF: string; // The unique reference field
}

const ReporterSchema: Schema<IReporter> = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      // unique: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      default: null,
      trim: true,
    },
    role: {
      type: String,
      default: null,
      trim: true,
    },
    requiresFeedback: {
      type: Boolean,
      required: true,
      default: false,
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

const Reporter =
  mongoose.models.Reporter ||
  mongoose.model<IReporter>("Reporter", ReporterSchema);

export default Reporter;
