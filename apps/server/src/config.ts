import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const here = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(here, "../../../.env") });
loadEnv({ path: resolve(here, "../.env") });

export interface ServerConfig {
  port: number;
  host: string;
  mongoUri: string;
  gatewayToken: string;
}

export function loadServerConfig(): ServerConfig {
  return {
    port: Number(process.env.PORT ?? 5050),
    host: process.env.HOST ?? "127.0.0.1",
    mongoUri:
      process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/coldmonitor",
    gatewayToken: process.env.GATEWAY_TOKEN ?? "dev-token",
  };
}
