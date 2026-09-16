import {
  createHttpIngestClient,
  httpUrlFromWs,
  type SensorIngest,
} from "@cold/emulator";
import type { Reading } from "@cold/shared";
import { gaussian } from "./gaussian.js";

export type GeneratorMode =
  | "auto"
  | "stable"
  | "door_open"
  | "cooling_failure"
  | "overcool";

export interface GeneratorOptions {
  deviceId: string;
  intervalMs?: number;
  mode?: GeneratorMode;
  ingest?: SensorIngest;
}

type EventKind = "none" | "door_open" | "cooling_failure" | "overcool";

interface GeneratorHandle {
  start(): Promise<void>;
  stop(): Promise<void>;
}

function pickAutoEvent(): EventKind {
  const roll = Math.random();
  if (roll < 0.08) return "door_open";
  if (roll < 0.12) return "cooling_failure";
  if (roll < 0.16) return "overcool";
  return "none";
}

function driftFor(event: EventKind): number {
  switch (event) {
    case "door_open":
      return 0.05 + Math.random() * 0.1;
    case "cooling_failure":
      return 0.25 + Math.random() * 0.45;
    case "overcool":
      return -(0.08 + Math.random() * 0.12);
    default:
      return 0;
  }
}

export function createGenerator(options: GeneratorOptions): GeneratorHandle {
  const intervalMs = options.intervalMs ?? 2000;
  const mode = options.mode ?? "auto";
  const wsUrl = process.env.EMULATOR_WS_URL ?? "ws://127.0.0.1:5051";
  const ingest =
    options.ingest ?? createHttpIngestClient(httpUrlFromWs(wsUrl));

  let timer: ReturnType<typeof setInterval> | undefined;
  let temperature = 4.2;
  let event: EventKind = mode === "auto" || mode === "stable" ? "none" : mode;
  let eventTicksLeft = 0;

  async function tick(): Promise<void> {
    if (mode === "auto" && event === "none" && Math.random() < 0.12) {
      event = pickAutoEvent();
      eventTicksLeft = 8 + Math.floor(Math.random() * 12);
    }

    if (mode === "stable") {
      event = "none";
    } else if (mode !== "auto") {
      event = mode;
    }

    const noise = gaussian(0, 0.04);
    if (event === "none") {
      temperature += (4.2 - temperature) * 0.08 + noise;
    } else {
      temperature += driftFor(event) + noise * 0.3;
      eventTicksLeft -= 1;
      if (mode === "auto" && eventTicksLeft <= 0) {
        event = "none";
      }
    }

    const reading: Reading = {
      deviceId: options.deviceId,
      temperature: Number(temperature.toFixed(2)),
      timestamp: new Date().toISOString(),
      source: "generator",
    };

    try {
      await ingest.push(reading);
      console.log(
        `[generator] ${reading.deviceId} ${reading.temperature}°C ${event}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[generator] не удалось отправить в эмулятор: ${message}`);
    }
  }

  return {
    async start() {
      await ingest.start();
      await tick();
      timer = setInterval(() => {
        void tick();
      }, intervalMs);
    },
    async stop() {
      if (timer) {
        clearInterval(timer);
        timer = undefined;
      }
      await ingest.stop();
    },
  };
}
