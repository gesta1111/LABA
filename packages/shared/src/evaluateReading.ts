import {
  foodAtRiskThreshold,
  freezeThreshold,
} from "./thresholds.js";
import type {
  AlertType,
  Device,
  DeviceStatus,
  EvaluateResult,
  Reading,
} from "./types.js";

const SLOW_RISE_PER_SEC = 0.02;
const FAST_RISE_PER_SEC = 0.1;

export function evaluateReading(
  prev: Reading | null,
  next: Reading,
  device: Pick<Device, "minC" | "maxC">,
): EvaluateResult {
  const alerts: AlertType[] = [];
  const { temperature } = next;
  const { minC, maxC } = device;

  let status: DeviceStatus = "normal";
  if (temperature > maxC) {
    status = "high";
    alerts.push("TEMP_HIGH");
  } else if (temperature < minC) {
    status = "low";
    alerts.push("TEMP_LOW");
  }

  if (temperature >= foodAtRiskThreshold(maxC)) {
    alerts.push("FOOD_AT_RISK");
  }
  if (temperature <= freezeThreshold(minC)) {
    alerts.push("POSSIBLE_FREEZE");
  }

  if (prev) {
    const dtSec =
      (Date.parse(next.timestamp) - Date.parse(prev.timestamp)) / 1000;
    if (Number.isFinite(dtSec) && dtSec > 0) {
      const rate = (next.temperature - prev.temperature) / dtSec;
      if (rate >= FAST_RISE_PER_SEC) {
        alerts.push("FAST_RISE");
      } else if (rate >= SLOW_RISE_PER_SEC) {
        alerts.push("SLOW_RISE");
      }
    }
  }

  return { status, alerts };
}
