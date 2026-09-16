import {
  DEFAULT_MAX_C,
  DEFAULT_MIN_C,
  evaluateReading,
  type Alert,
  type AlertType,
  type Device,
  type Reading,
} from "@cold/shared";
import type { FastifyInstance } from "fastify";
import { AlertModel } from "../models/alert.js";
import { DeviceModel, type DeviceDoc } from "../models/device.js";
import { ReadingModel } from "../models/reading.js";

function toDevice(doc: DeviceDoc): Device {
  return {
    id: doc._id,
    name: doc.name,
    minC: doc.minC,
    maxC: doc.maxC,
    createdAt: doc.createdAt,
    lastTemperature: doc.lastTemperature,
    lastUpdatedAt: doc.lastUpdatedAt,
    status: doc.status,
  };
}

function toAlert(doc: {
  _id: string;
  deviceId: string;
  type: AlertType;
  temperature: number;
  createdAt: string;
}): Alert {
  return {
    id: doc._id,
    deviceId: doc.deviceId,
    type: doc.type,
    temperature: doc.temperature,
    createdAt: doc.createdAt,
  };
}

export class IngestService {
  constructor(private readonly app: FastifyInstance) {}

  async accept(raw: Reading): Promise<{ device: Device; reading: Reading; alerts: Alert[] }> {
    if (!raw.deviceId || !Number.isFinite(raw.temperature)) {
      throw this.app.httpErrors.badRequest("Некорректный Reading");
    }

    const reading: Reading = {
      deviceId: raw.deviceId,
      temperature: raw.temperature,
      timestamp: raw.timestamp || new Date().toISOString(),
      source: raw.source === "manual" ? "manual" : "generator",
    };

    let deviceDoc = await DeviceModel.findById(reading.deviceId);
    if (!deviceDoc) {
      deviceDoc = await DeviceModel.create({
        _id: reading.deviceId,
        name: reading.deviceId,
        minC: DEFAULT_MIN_C,
        maxC: DEFAULT_MAX_C,
      });
    }

    const prevDoc = await ReadingModel.findOne({ deviceId: reading.deviceId })
      .sort({ timestamp: -1 })
      .lean();
    const prev: Reading | null = prevDoc
      ? {
          deviceId: prevDoc.deviceId,
          temperature: prevDoc.temperature,
          timestamp: prevDoc.timestamp,
          source: prevDoc.source,
        }
      : null;

    const verdict = evaluateReading(prev, reading, {
      minC: deviceDoc.minC,
      maxC: deviceDoc.maxC,
    });

    await ReadingModel.create({
      deviceId: reading.deviceId,
      temperature: reading.temperature,
      timestamp: reading.timestamp,
      source: reading.source,
    });

    const previousTypes = new Set(deviceDoc.lastAlertTypes);
    const freshTypes = verdict.alerts.filter((type) => !previousTypes.has(type));

    deviceDoc.lastTemperature = reading.temperature;
    deviceDoc.lastUpdatedAt = reading.timestamp;
    deviceDoc.status = verdict.status;
    deviceDoc.lastAlertTypes = verdict.alerts;
    await deviceDoc.save();

    const createdAlerts: Alert[] = [];
    for (const type of freshTypes) {
      const doc = await AlertModel.create({
        deviceId: reading.deviceId,
        type,
        temperature: reading.temperature,
        createdAt: reading.timestamp,
      });
      createdAlerts.push(toAlert(doc));
    }

    const device = toDevice(deviceDoc);
    const room = `device:${reading.deviceId}`;
    this.app.io.to(room).emit("reading:new", reading);
    this.app.io.to(room).emit("device:updated", device);
    for (const alert of createdAlerts) {
      this.app.io.to(room).emit("alert:new", alert);
      this.app.io.to("alerts").emit("alert:new", alert);
    }

    return { device, reading, alerts: createdAlerts };
  }
}
