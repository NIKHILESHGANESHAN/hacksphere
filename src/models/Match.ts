import mongoose, { Schema, Document, models } from "mongoose";

export interface IMatch extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  eventId?: mongoose.Types.ObjectId; // Optional context
}

const MatchSchema = new Schema<IMatch>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["PENDING", "ACCEPTED", "REJECTED"], default: "PENDING" },
    eventId: { type: Schema.Types.ObjectId, ref: "Event" },
  },
  { timestamps: true }
);

export const Match = models.Match || mongoose.model<IMatch>("Match", MatchSchema);
