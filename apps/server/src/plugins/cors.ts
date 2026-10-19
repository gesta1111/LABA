import cors from "@fastify/cors";
import fp from "fastify-plugin";

export default fp(async (fastify) => {
  await fastify.register(cors, {
    origin: true,
    // Явно: иначе preflight может отдать только GET,HEAD,POST без PATCH/DELETE
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-gateway-token"],
  });
});
