import { config as loadEnv } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createGenerator,
  type GeneratorMode,
} from "./createGenerator.js";

const here = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(here, "../../../.env") });
loadEnv({ path: resolve(here, "../.env") });

const intervalMs = Number(process.env.INTERVAL_MS ?? 2000);
const mode = (process.env.MODE ?? "auto") as GeneratorMode;
const ids = (process.env.DEVICE_IDS ?? process.env.DEVICE_ID ?? "fridge-1")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

const generators = ids.map((deviceId) =>
  createGenerator({ deviceId, intervalMs, mode }),
);

for (const generator of generators) {
  await generator.start();
}

console.log(
  `[generator] устройства: ${ids.join(", ")} каждые ${intervalMs} мс, режим ${mode}`,
);

const shutdown = async () => {
  for (const generator of generators) {
    await generator.stop();
  }
  process.exit(0);
};

process.on("SIGINT", () => {
  void shutdown();
});
process.on("SIGTERM", () => {
  void shutdown();
});
