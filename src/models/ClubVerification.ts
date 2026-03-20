import mongoose, { Schema, Document, models } from "mongoose";

export interface IClubVerification extends Document {
  userId: mongoose.Types.ObjectId;
  clubName: string;
  idProofUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

const ClubVerificationSchema = new Schema<IClubVerification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    clubName: { type: String, required: true },
    idProofUrl: { type: String, required: true },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
  },
  { timestamps: true }
);

export const ClubVerification = models.ClubVerification || mongoose.model<IClubVerification>("ClubVerification", ClubVerificationSchema);
