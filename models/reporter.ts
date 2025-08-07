import mongoose, { Document, Schema } from "mongoose";

export interface IReporter extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  company?: string;
  role?: string;
  wantsFeedback: boolean;
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
      unique: true,
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
    wantsFeedback: {
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
