import assert from "node:assert/strict";
import { test } from "node:test";
import { evaluateReading } from "./evaluateReading.ts";
import { DEFAULT_MAX_C, DEFAULT_MIN_C } from "./types.ts";

const device = { minC: DEFAULT_MIN_C, maxC: DEFAULT_MAX_C };

test("нормальная температура не создаёт тревог", () => {
  const result = evaluateReading(
    null,
    {
      deviceId: "f1",
      temperature: 4.2,
      timestamp: "2026-01-01T00:00:00.000Z",
      source: "generator",
    },
    device,
  );
  assert.equal(result.status, "normal");
  assert.deepEqual(result.alerts, []);
});

test("высокая температура и риск для продуктов", () => {
  const result = evaluateReading(
    null,
    {
      deviceId: "f1",
      temperature: 12,
      timestamp: "2026-01-01T00:00:00.000Z",
      source: "generator",
    },
    device,
  );
  assert.equal(result.status, "high");
  assert.ok(result.alerts.includes("TEMP_HIGH"));
  assert.ok(result.alerts.includes("FOOD_AT_RISK"));
});

test("возможное замерзание", () => {
  const result = evaluateReading(
    null,
    {
      deviceId: "f1",
      temperature: -1,
      timestamp: "2026-01-01T00:00:00.000Z",
      source: "generator",
    },
    device,
  );
  assert.equal(result.status, "low");
  assert.ok(result.alerts.includes("TEMP_LOW"));
  assert.ok(result.alerts.includes("POSSIBLE_FREEZE"));
});

test("медленный и быстрый рост относительно предыдущего замера", () => {
  const prev = {
    deviceId: "f1",
    temperature: 4,
    timestamp: "2026-01-01T00:00:00.000Z",
    source: "generator" as const,
  };
  const slow = evaluateReading(
    prev,
    {
      ...prev,
      temperature: 4.12,
      timestamp: "2026-01-01T00:00:02.000Z",
    },
    device,
  );
  assert.ok(slow.alerts.includes("SLOW_RISE"));

  const fast = evaluateReading(
    prev,
    {
      ...prev,
      temperature: 4.5,
      timestamp: "2026-01-01T00:00:02.000Z",
    },
    device,
  );
  assert.ok(fast.alerts.includes("FAST_RISE"));
});
