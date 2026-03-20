import mongoose, { Schema, Document, models } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  dateTime: Date;
  teamSize: number;
  domain: string;
  requiredSkills: string[];
  contactDetails: string;
  clubId: mongoose.Types.ObjectId;
  interestedUsers: mongoose.Types.ObjectId[];
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    dateTime: { type: Date, required: true },
    teamSize: { type: Number, required: true, default: 1 },
    domain: { type: String, required: true },
    requiredSkills: { type: [String], default: [] },
    contactDetails: { type: String, required: true },
    clubId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    interestedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }], // Used for XConnect system counting
  },
  { timestamps: true }
);

export const Event = models.Event || mongoose.model<IEvent>("Event", EventSchema);
