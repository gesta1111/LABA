import Fastify from "fastify";
import app from "./app.js";
import { loadServerConfig } from "./config.js";

const config = loadServerConfig();
const server = Fastify({ logger: true });

await server.register(app);

try {
  await server.listen({ port: config.port, host: config.host });
} catch (error) {
  server.log.error(error);
  process.exit(1);
}
