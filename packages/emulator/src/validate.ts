import type { Reading, ReadingSource } from "@cold/shared";

const SOURCES: readonly ReadingSource[] = ["generator", "manual"];

export class IngestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IngestValidationError";
  }
}

export function validateReading(input: unknown): Reading {
  if (input === null || typeof input !== "object") {
    throw new IngestValidationError("Ожидался JSON-объект Reading");
  }

  const body = input as Record<string, unknown>;
  const deviceId = body.deviceId;
  if (typeof deviceId !== "string" || deviceId.trim() === "") {
    throw new IngestValidationError("Нужен непустой deviceId");
  }

  const temperature = body.temperature;
  if (typeof temperature !== "number" || !Number.isFinite(temperature)) {
    throw new IngestValidationError("temperature должна быть конечным числом");
  }

  let source: ReadingSource = "generator";
  if (body.source !== undefined) {
    if (typeof body.source !== "string" || !SOURCES.includes(body.source as ReadingSource)) {
      throw new IngestValidationError('source должен быть "generator" или "manual"');
    }
    source = body.source as ReadingSource;
  }

  let timestamp: string;
  if (body.timestamp === undefined || body.timestamp === "") {
    timestamp = new Date().toISOString();
  } else if (typeof body.timestamp !== "string" || Number.isNaN(Date.parse(body.timestamp))) {
    throw new IngestValidationError("timestamp должен быть ISO-строкой");
  } else {
    timestamp = body.timestamp;
  }

  return {
    deviceId: deviceId.trim(),
    temperature,
    timestamp,
    source,
  };
}
