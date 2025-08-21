import mongoose, { Document, Schema } from "mongoose";

export interface IReporter extends Document {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneNumber: string | null;
  company: string | null;
  role: string | null;
  requiresFeedback: boolean;
  REF: string; // The unique reference field
  isAnonymous: boolean;
}

const ReporterSchema: Schema<IReporter> = new Schema(
  {
    firstName: {
      type: String || null,
      trim: true,

    },
    lastName: {
      type: String || null,
      trim: true,

    },
    email: {
      type: String || null,
      lowercase: true,
      trim: true,

    },
    phoneNumber: {
      type: String || null,
      trim: true,

    },
    company: {
      type: String || null,

      trim: true,
    },
    role: {
      type: String || null,

      trim: true,
    },
    requiresFeedback: {
      type: Boolean,
      default: false,

    },
    REF: {
      type: String,
      required: true,
      unique: true,
    },
    isAnonymous: {
      type: Boolean,
      required: true,
      default: false,
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
