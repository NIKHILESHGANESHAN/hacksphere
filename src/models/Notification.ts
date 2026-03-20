import mongoose, { Schema, Document, models } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: "MATCH_REQUEST" | "MATCH_ACCEPTED" | "NEW_MESSAGE" | "SYSTEM";
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["MATCH_REQUEST", "MATCH_ACCEPTED", "NEW_MESSAGE", "SYSTEM"], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: true }
);

export const Notification = models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
