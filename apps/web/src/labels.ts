import type { AlertType, DeviceStatus } from "@cold/shared";

export const STATUS_LABEL: Record<DeviceStatus, string> = {
  normal: "Норма",
  high: "Высокая",
  low: "Низкая",
};

export const ALERT_LABEL: Record<AlertType, string> = {
  TEMP_HIGH: "Температура выше нормы",
  TEMP_LOW: "Температура ниже нормы",
  FOOD_AT_RISK: "Продукты под угрозой",
  POSSIBLE_FREEZE: "Возможно замерзание",
  SLOW_RISE: "Медленный рост температуры",
  FAST_RISE: "Быстрый рост температуры",
};

export function statusBadge(status: DeviceStatus | undefined): string {
  if (status === "high") return "badge badge-error";
  if (status === "low") return "badge badge-info";
  return "badge badge-success";
}

export function formatTime(iso: string | undefined): string {
  if (!iso) return "нет данных";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("ru-RU");
}
