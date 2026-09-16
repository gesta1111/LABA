import { DEFAULT_MAX_C, DEFAULT_MIN_C, type Device } from "@cold/shared";
import type { FastifyPluginAsync } from "fastify";
import { DeviceModel, type DeviceDoc } from "../models/device.js";

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

const devicesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/api/devices", async () => {
    const docs = await DeviceModel.find().sort({ createdAt: -1 });
    return docs.map((doc) => toDevice(doc));
  });

  fastify.post("/api/devices", async (request, reply) => {
    const body = request.body as { name?: string };
    if (!body?.name || typeof body.name !== "string" || body.name.trim() === "") {
      throw fastify.httpErrors.badRequest("Нужно имя устройства");
    }
    const doc = await DeviceModel.create({
      name: body.name.trim(),
      minC: DEFAULT_MIN_C,
      maxC: DEFAULT_MAX_C,
    });
    return reply.code(201).send(toDevice(doc));
  });

  fastify.patch("/api/devices/:id", async (request) => {
    const { id } = request.params as { id: string };
    const body = request.body as { name?: string; minC?: number; maxC?: number };
    const doc = await DeviceModel.findById(id);
    if (!doc) {
      throw fastify.httpErrors.notFound("Устройство не найдено");
    }
    if (typeof body.name === "string" && body.name.trim()) {
      doc.name = body.name.trim();
    }
    if (typeof body.minC === "number" && Number.isFinite(body.minC)) {
      doc.minC = body.minC;
    }
    if (typeof body.maxC === "number" && Number.isFinite(body.maxC)) {
      doc.maxC = body.maxC;
    }
    await doc.save();
    const device = toDevice(doc);
    fastify.io.to(`device:${id}`).emit("device:updated", device);
    return device;
  });

  fastify.delete("/api/devices/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const doc = await DeviceModel.findByIdAndDelete(id);
    if (!doc) {
      throw fastify.httpErrors.notFound("Устройство не найдено");
    }
    return reply.code(204).send();
  });
};

export default devicesRoutes;
