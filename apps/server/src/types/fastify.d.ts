import type { IngestService } from "./services/ingest.js";
import type { ServerConfig } from "./config.js";
import type { Server as SocketIOServer } from "socket.io";

declare module "fastify" {
  interface FastifyInstance {
    config: ServerConfig;
    io: SocketIOServer;
    ingest: IngestService;
  }
}

export {};
