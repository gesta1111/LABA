import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Device, Reading } from "@cold/shared";
import { api } from "../api.ts";
import { Sparkline } from "../components/Sparkline.tsx";
import { formatTime, STATUS_LABEL, statusBadge } from "../labels.ts";
import { connectSocket } from "../socket.ts";

export function DeviceDetail() {
  const { id = "" } = useParams();
  const [device, setDevice] = useState<Device | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [devices, list] = await Promise.all([api.devices(), api.readings(id)]);
      setDevice(devices.find((item) => item.id === id) ?? null);
      setReadings(list);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  useEffect(() => {
    const socket = connectSocket();
    socket.emit("subscribe", id);
    socket.on("reading:new", (reading: Reading) => {
      if (reading.deviceId !== id) return;
      setReadings((prev) => [reading, ...prev].slice(0, 1800));
    });
    socket.on("device:updated", (next: Device) => {
      if (next.id === id) setDevice(next);
    });
    return () => {
      socket.emit("unsubscribe", id);
      socket.close();
    };
  }, [id]);

  const hourValues = useMemo(() => {
    const from = Date.now() - 60 * 60 * 1000;
    return readings
      .filter((item) => Date.parse(item.timestamp) >= from)
      .slice()
      .reverse()
      .map((item) => item.temperature);
  }, [readings]);

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }
  if (loading) {
    return <p>Загрузка…</p>;
  }
  if (!device) {
    return <p>Камера не найдена</p>;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">{device.name}</h1>
        <div className="flex gap-2">
          <button className="btn btn-outline" type="button" onClick={() => void load()}>
            Обновить
          </button>
          <Link className="btn" to={`/devices/${id}/settings`}>
            Настройки
          </Link>
        </div>
      </div>
      <div className="stats bg-base-100 shadow w-full">
        <div className="stat">
          <div className="stat-title">Текущая температура</div>
          <div className="stat-value">
            {device.lastTemperature !== undefined
              ? `${device.lastTemperature.toFixed(1)} °C`
              : "—"}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">Статус</div>
          <div className="stat-value text-xl">
            <span className={statusBadge(device.status)}>
              {STATUS_LABEL[device.status ?? "normal"]}
            </span>
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">Последнее обновление</div>
          <div className="stat-value text-lg">{formatTime(device.lastUpdatedAt)}</div>
        </div>
      </div>
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Последний час</h2>
          <Sparkline values={hourValues} minC={device.minC} maxC={device.maxC} />
        </div>
      </div>
    </section>
  );
}
