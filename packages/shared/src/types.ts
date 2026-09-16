export const DEFAULT_MIN_C = 2;
export const DEFAULT_MAX_C = 8;

export type ReadingSource = "generator" | "manual";

export interface Reading {
  deviceId: string;
  temperature: number;
  timestamp: string;
  source: ReadingSource;
}

export type AlertType =
  | "TEMP_HIGH"
  | "TEMP_LOW"
  | "FOOD_AT_RISK"
  | "POSSIBLE_FREEZE"
  | "SLOW_RISE"
  | "FAST_RISE";

export type DeviceStatus = "normal" | "high" | "low";

export interface Device {
  id: string;
  name: string;
  minC: number;
  maxC: number;
  createdAt: string;
  lastTemperature?: number;
  lastUpdatedAt?: string;
  status?: DeviceStatus;
}

export interface Alert {
  id: string;
  deviceId: string;
  type: AlertType;
  temperature: number;
  createdAt: string;
}

export interface EvaluateResult {
  status: DeviceStatus;
  alerts: AlertType[];
}
