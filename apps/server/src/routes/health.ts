import type { FastifyPluginAsync } from "fastify";

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/api/health", async () => ({
    ok: true,
    service: "server",
  }));
};

export default healthRoutes;
