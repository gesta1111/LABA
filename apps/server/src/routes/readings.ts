import type { FastifyPluginAsync } from "fastify";
import type { Reading } from "@cold/shared";
import { ReadingModel } from "../models/reading.js";

const readingsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/api/readings", async (request, reply) => {
    const header = request.headers["x-gateway-token"];
    const token = Array.isArray(header) ? header[0] : header;
    if (token !== fastify.config.gatewayToken) {
      throw fastify.httpErrors.unauthorized("Неверный X-Gateway-Token");
    }
    const result = await fastify.ingest.accept(request.body as Reading);
    return reply.code(201).send(result);
  });

  fastify.get("/api/readings", async (request) => {
    const query = request.query as { deviceId?: string; limit?: string };
    const limit = Math.min(2000, Math.max(1, Number(query.limit ?? 200) || 200));
    const filter = query.deviceId ? { deviceId: query.deviceId } : {};
    const docs = await ReadingModel.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    return docs.map((doc) => ({
      deviceId: doc.deviceId,
      temperature: doc.temperature,
      timestamp: doc.timestamp,
      source: doc.source,
    }));
  });
};

export default readingsRoutes;
