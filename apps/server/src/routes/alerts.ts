import type { Alert, AlertType } from "@cold/shared";
import type { FastifyPluginAsync } from "fastify";
import { AlertModel } from "../models/alert.js";

const alertsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/api/alerts", async (request) => {
    const query = request.query as { deviceId?: string };
    const filter = query.deviceId ? { deviceId: query.deviceId } : {};
    const docs = await AlertModel.find(filter).sort({ createdAt: -1 }).limit(500);
    return docs.map(
      (doc): Alert => ({
        id: doc._id,
        deviceId: doc.deviceId,
        type: doc.type as AlertType,
        temperature: doc.temperature,
        createdAt: doc.createdAt,
      }),
    );
  });

  fastify.delete("/api/alerts/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const doc = await AlertModel.findByIdAndDelete(id);
    if (!doc) {
      throw fastify.httpErrors.notFound("Оповещение не найдено");
    }
    return reply.code(204).send();
  });

  fastify.delete("/api/alerts", async () => {
    await AlertModel.deleteMany({});
    return { ok: true };
  });
};

export default alertsRoutes;
