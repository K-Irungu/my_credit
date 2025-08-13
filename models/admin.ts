import mongoose, { Schema, Document } from "mongoose";

// Corrected Interface to include password reset fields
export interface IAdmin extends Document {
  fullName: string;
  email: string;
  password: string;
  verifyOtp: string;
  verificationExpiration: Date;
  lastLogin?: Date;
  phoneNumber: string;
  sessionToken: string;
  deviceId?: string; // deviceId is now optional and not unique
  resetPasswordToken?: string; // Added the reset password token
  resetPasswordExpires?: Date; // Corrected type to Date
}

const AdminSchema: Schema<IAdmin> = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    verifyOtp: {
      type: String,
    },
    verificationExpiration: {
      type: Date,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    sessionToken: {
      type: String,
    },
    deviceId: {
      type: String,
      unique: true
      // Removed `unique: true`
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date, // Corrected to Date type
    },
  },
  {
    timestamps: true,
  }
);

const Admin =
  mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);
export default Admin;