import type { Reading } from "@cold/shared";
import WebSocket from "ws";
import { nextBackoffMs, sleep } from "./backoff.js";
import { loadConfig } from "./config.js";
import { createServerForwarder } from "./forward.js";

function isReading(value: unknown): value is Reading {
  if (value === null || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return (
    typeof body.deviceId === "string" &&
    typeof body.temperature === "number" &&
    Number.isFinite(body.temperature) &&
    typeof body.timestamp === "string" &&
    (body.source === "generator" || body.source === "manual")
  );
}

const config = loadConfig();
const forwarder = createServerForwarder(config);

let stopped = false;
let attempt = 0;

async function connectLoop(): Promise<void> {
  while (!stopped) {
    const ok = await new Promise<boolean>((resolve) => {
      const socket = new WebSocket(config.emulatorWsUrl);

      socket.on("open", () => {
        attempt = 0;
        console.log(`[gateway] эмулятор ${config.emulatorWsUrl}`);
      });

      socket.on("message", (raw) => {
        void (async () => {
          try {
            const parsed: unknown = JSON.parse(String(raw));
            if (!isReading(parsed)) {
              return;
            }
            console.log(
              `[gateway] ${parsed.deviceId} ${parsed.temperature}°C ${parsed.timestamp}`,
            );
            await forwarder.send(parsed);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`[gateway] пересылка: ${message}`);
          }
        })();
      });

      socket.on("close", () => {
        resolve(false);
      });
      socket.on("error", (error) => {
        console.error(`[gateway] WS эмулятора: ${error.message}`);
      });
    });

    if (stopped || ok) {
      continue;
    }
    attempt += 1;
    const wait = nextBackoffMs(attempt);
    console.log(`[gateway] повтор через ${Math.round(wait)} мс`);
    await sleep(wait);
  }
}

process.on("SIGINT", () => {
  stopped = true;
  forwarder.close();
  process.exit(0);
});
process.on("SIGTERM", () => {
  stopped = true;
  forwarder.close();
  process.exit(0);
});

console.log("[gateway] старт, ожидание эмулятора и сервера");
void connectLoop();
