import fp from "fastify-plugin";
import { Server } from "socket.io";
import type { Reading } from "@cold/shared";

export default fp(async (fastify) => {
  const io = new Server(fastify.server, {
    cors: { origin: true },
  });

  io.on("connection", (socket) => {
    socket.on("subscribe", (deviceId: string) => {
      if (typeof deviceId === "string" && deviceId) {
        void socket.join(`device:${deviceId}`);
      }
    });
    socket.on("unsubscribe", (deviceId: string) => {
      if (typeof deviceId === "string" && deviceId) {
        void socket.leave(`device:${deviceId}`);
      }
    });
    socket.on("subscribe:alerts", () => {
      void socket.join("alerts");
    });
    socket.on("reading:ingest", (payload: Reading, ack?: (result: { ok: boolean }) => void) => {
      const token = socket.handshake.headers["x-gateway-token"];
      const header = Array.isArray(token) ? token[0] : token;
      if (header !== fastify.config.gatewayToken) {
        ack?.({ ok: false });
        return;
      }
      void fastify.ingest
        .accept(payload)
        .then(() => ack?.({ ok: true }))
        .catch(() => ack?.({ ok: false }));
    });
  });

  fastify.decorate("io", io);
  fastify.addHook("onClose", async () => {
    io.close();
  });
});
