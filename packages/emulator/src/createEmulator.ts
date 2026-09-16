import type { Reading } from "@cold/shared";
import type { SensorIngest } from "./ingest.js";
import { validateReading } from "./validate.js";

export function createEmulator(): SensorIngest {
  const handlers = new Set<(reading: Reading) => void>();
  let running = false;

  return {
    async start() {
      running = true;
    },
    async stop() {
      running = false;
      handlers.clear();
    },
    async push(reading) {
      if (!running) {
        throw new Error("Эмулятор не запущен");
      }
      const clean = validateReading(reading);
      for (const handler of handlers) {
        handler(clean);
      }
    },
    onReading(handler) {
      handlers.add(handler);
      return () => {
        handlers.delete(handler);
      };
    },
  };
}
