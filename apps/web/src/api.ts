import type { Alert, Device, Reading } from "@cold/shared";

const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5050";

function request(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API}${path}`, {
    ...init,
    signal: AbortSignal.timeout(8000),
  });
}

async function parse<T>(resPromise: Promise<Response>): Promise<T> {
  let res: Response;
  try {
    res = await resPromise;
  } catch {
    throw new Error("Нет связи с сервером. Запустите backend и MongoDB.");
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Ошибка ${res.status}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

export const api = {
  devices: () => parse<Device[]>(request("/api/devices")),
  createDevice: (name: string) =>
    parse<Device>(
      request("/api/devices", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      }),
    ),
  updateDevice: (id: string, body: { name?: string; minC?: number; maxC?: number }) =>
    parse<Device>(
      request(`/api/devices/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
    ),
  deleteDevice: (id: string) =>
    parse<void>(request(`/api/devices/${id}`, { method: "DELETE" })),
  readings: (deviceId: string, limit = 1800) =>
    parse<Reading[]>(
      request(`/api/readings?deviceId=${encodeURIComponent(deviceId)}&limit=${limit}`),
    ),
  alerts: (deviceId?: string) =>
    parse<Alert[]>(
      request(deviceId ? `/api/alerts?deviceId=${encodeURIComponent(deviceId)}` : "/api/alerts"),
    ),
  deleteAlert: (id: string) =>
    parse<void>(request(`/api/alerts/${id}`, { method: "DELETE" })),
  clearAlerts: () => parse<{ ok: boolean }>(request("/api/alerts", { method: "DELETE" })),
};
