import mongoose, { Schema, Document, models } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otp: string;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // Auto-expires doc after 5 mins
});

export const Otp = models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);
