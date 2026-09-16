import { randomUUID } from "node:crypto";
import type { AlertType } from "@cold/shared";
import mongoose, { Schema } from "mongoose";

export interface AlertDoc {
  _id: string;
  deviceId: string;
  type: AlertType;
  temperature: number;
  createdAt: string;
}

const alertSchema = new Schema<AlertDoc>(
  {
    _id: { type: String, default: () => randomUUID() },
    deviceId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: [
        "TEMP_HIGH",
        "TEMP_LOW",
        "FOOD_AT_RISK",
        "POSSIBLE_FREEZE",
        "SLOW_RISE",
        "FAST_RISE",
      ],
      required: true,
    },
    temperature: { type: Number, required: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { versionKey: false, collection: "alerts" },
);

alertSchema.index({ deviceId: 1, createdAt: -1 });

export const AlertModel = mongoose.model<AlertDoc>("Alert", alertSchema);
