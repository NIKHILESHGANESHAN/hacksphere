import mongoose, { Schema, Document, models } from "mongoose";

export interface IUser extends Document {
  email: string;
  name?: string;
  year?: number;
  department?: string;
  skills: string[];
  interests: string[];
  role: "STUDENT" | "CLUB_MEMBER" | "ADMIN";
  isVerified: boolean;
  warnings: number;
  isBanned: boolean;
  points: number;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    year: { type: Number },
    department: { type: String },
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    role: { type: String, enum: ["STUDENT", "CLUB_MEMBER", "ADMIN"], default: "STUDENT" },
    isVerified: { type: Boolean, default: false }, // Admin must set true for Club members
    warnings: { type: Number, default: 0 },
    isBanned: { type: Boolean, default: false },
    points: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const User = models.User || mongoose.model<IUser>("User", UserSchema);
