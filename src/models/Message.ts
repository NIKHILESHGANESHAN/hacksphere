import mongoose, { Schema, Document, models } from "mongoose";

export interface IMessage extends Document {
  matchId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  isDeleted: boolean; // For moderation purposes
}

const MessageSchema = new Schema<IMessage>(
  {
    matchId: { type: Schema.Types.ObjectId, ref: "Match", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Message = models.Message || mongoose.model<IMessage>("Message", MessageSchema);
