import { config as loadEnv } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createEmulator } from "./createEmulator.js";
import { startEmulatorServer } from "./httpServer.js";

const here = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(here, "../../../.env") });
loadEnv({ path: resolve(here, "../.env") });

const port = Number(process.env.EMULATOR_PORT ?? 5051);

const ingest = createEmulator();
await ingest.start();
await startEmulatorServer(ingest, port);

console.log(`[emulator] WS/HTTP 127.0.0.1:${port}  POST /ingest`);
