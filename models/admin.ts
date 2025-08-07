import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
  fullName: string;
  email: string;
  password: string;
  verifyOtp: string;
  verificationExpiration: Date;
  lastLogin?: Date;
  phoneNumber: string;
}

const AdminSchema: Schema<IAdmin> = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim:true
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    verifyOtp: {
      type: String,
      required: true,
    },
    verificationExpiration: {
      type: Date,
      required: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Admin =
  mongoose.models.Admin || 
  mongoose.model<IAdmin>("Admin", AdminSchema);
export default Admin;
