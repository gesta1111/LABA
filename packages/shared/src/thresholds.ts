import { DEFAULT_MAX_C, DEFAULT_MIN_C } from "./types.js";

/** Границы камеры холодильника по заданию лаборатории. */
export const FRIDGE_TARGET = {
  minC: DEFAULT_MIN_C,
  maxC: DEFAULT_MAX_C,
} as const;

export function isInRange(
  temperature: number,
  minC = DEFAULT_MIN_C,
  maxC = DEFAULT_MAX_C,
): boolean {
  return temperature >= minC && temperature <= maxC;
}

/** Порог «продукты под угрозой»: maxC + 3. */
export function foodAtRiskThreshold(maxC = DEFAULT_MAX_C): number {
  return maxC + 3;
}

/** Порог «возможно замерзание»: minC - 2. */
export function freezeThreshold(minC = DEFAULT_MIN_C): number {
  return minC - 2;
}
