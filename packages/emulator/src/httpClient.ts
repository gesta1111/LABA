import type { Reading } from "@cold/shared";
import type { SensorIngest } from "./ingest.js";

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

/** Клиент публичного HTTP-входа эмулятора (для генератора в отдельном процессе). */
export function createHttpIngestClient(baseUrl: string): SensorIngest {
  return {
    async start() {
      // Соединение устанавливается на каждый push.
    },
    async stop() {
      // Нечего закрывать.
    },
    async push(reading: Reading) {
      const response = await fetch(joinUrl(baseUrl, "/ingest"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(reading),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Эмулятор отклонил замер: ${response.status} ${text}`);
      }
    },
    onReading() {
      return () => {
        // HTTP-клиент не получает исходящий поток.
      };
    },
  };
}

export function httpUrlFromWs(wsUrl: string): string {
  return wsUrl.replace(/^ws/i, "http");
}
