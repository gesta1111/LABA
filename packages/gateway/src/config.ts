import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const here = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(here, "../../../.env") });
loadEnv({ path: resolve(here, "../.env") });

export interface GatewayConfig {
  emulatorWsUrl: string;
  apiUrl: string;
  socketUrl: string;
  token: string;
}

export function loadConfig(): GatewayConfig {
  return {
    emulatorWsUrl: process.env.EMULATOR_WS_URL ?? "ws://127.0.0.1:5051",
    apiUrl: process.env.VITE_API_URL ?? "http://127.0.0.1:5050",
    socketUrl: process.env.VITE_SOCKET_URL ?? "http://127.0.0.1:5050",
    token: process.env.GATEWAY_TOKEN ?? "dev-token",
  };
}
