import type { Reading } from "@cold/shared";

/** Публичный вход для генератора и реального датчика. */
export interface SensorIngest {
  push(reading: Reading): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  onReading(handler: (reading: Reading) => void): () => void;
}
