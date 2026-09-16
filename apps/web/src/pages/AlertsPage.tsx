import { useEffect, useState } from "react";
import type { Alert } from "@cold/shared";
import { api } from "../api.ts";
import { ALERT_LABEL, formatTime } from "../labels.ts";
import { connectSocket } from "../socket.ts";

export function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setAlerts(await api.alerts());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const socket = connectSocket();
    socket.emit("subscribe:alerts");
    socket.on("alert:new", (alert: Alert) => {
      setAlerts((prev) => [alert, ...prev]);
    });
    return () => {
      socket.close();
    };
  }, []);

  async function onClear() {
    if (!window.confirm("Очистить все оповещения?")) return;
    await api.clearAlerts();
    setAlerts([]);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Оповещения</h1>
        <button className="btn btn-outline" type="button" onClick={() => void onClear()}>
          Очистить
        </button>
      </div>
      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <p className="opacity-70">Загрузка…</p> : null}
      <div className="overflow-x-auto">
        <table className="table bg-base-100">
          <thead>
            <tr>
              <th>Тип</th>
              <th>Камера</th>
              <th>°C</th>
              <th>Время</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr key={alert.id}>
                <td>{ALERT_LABEL[alert.type]}</td>
                <td>{alert.deviceId}</td>
                <td>{alert.temperature.toFixed(1)}</td>
                <td>{formatTime(alert.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!loading && alerts.length === 0 ? <p className="opacity-70">Оповещений нет</p> : null}
    </section>
  );
}
