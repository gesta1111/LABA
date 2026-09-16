import * as path from "node:path";
import { fileURLToPath } from "node:url";
import AutoLoad from "@fastify/autoload";
import type { FastifyPluginAsync } from "fastify";
import { loadServerConfig } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.decorate("config", loadServerConfig());

  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    forceESM: true,
  });

  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
    forceESM: true,
  });
};

export default app;
