import { randomUUID } from "node:crypto";
import type { ReadingSource } from "@cold/shared";
import mongoose, { Schema } from "mongoose";

export interface ReadingDoc {
  _id: string;
  deviceId: string;
  temperature: number;
  timestamp: string;
  source: ReadingSource;
}

const readingSchema = new Schema<ReadingDoc>(
  {
    _id: { type: String, default: () => randomUUID() },
    deviceId: { type: String, required: true, index: true },
    temperature: { type: Number, required: true },
    timestamp: { type: String, required: true },
    source: { type: String, enum: ["generator", "manual"], required: true },
  },
  { versionKey: false, collection: "readings" },
);

readingSchema.index({ deviceId: 1, timestamp: -1 });

export const ReadingModel = mongoose.model<ReadingDoc>("Reading", readingSchema);
