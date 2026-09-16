import { randomUUID } from "node:crypto";
import { DEFAULT_MAX_C, DEFAULT_MIN_C, type DeviceStatus } from "@cold/shared";
import mongoose, { Schema } from "mongoose";

export interface DeviceDoc {
  _id: string;
  name: string;
  minC: number;
  maxC: number;
  createdAt: string;
  lastTemperature?: number;
  lastUpdatedAt?: string;
  status: DeviceStatus;
  lastAlertTypes: string[];
}

const deviceSchema = new Schema<DeviceDoc>(
  {
    _id: { type: String, default: () => randomUUID() },
    name: { type: String, required: true },
    minC: { type: Number, default: DEFAULT_MIN_C },
    maxC: { type: Number, default: DEFAULT_MAX_C },
    createdAt: { type: String, default: () => new Date().toISOString() },
    lastTemperature: { type: Number },
    lastUpdatedAt: { type: String },
    status: {
      type: String,
      enum: ["normal", "high", "low"],
      default: "normal",
    },
    lastAlertTypes: { type: [String], default: [] },
  },
  { versionKey: false, collection: "devices" },
);

export const DeviceModel = mongoose.model<DeviceDoc>("Device", deviceSchema);
