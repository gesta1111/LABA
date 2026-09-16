import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import type { Device } from "@cold/shared";
import { api } from "../api.ts";
import { formatTime, STATUS_LABEL, statusBadge } from "../labels.ts";

export function DeviceList() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setDevices(await api.devices());
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

  async function onAdd(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    try {
      await api.createDevice(name.trim());
      setName("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось добавить");
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Холодильники</h1>
      </div>
      <form className="join w-full max-w-lg" onSubmit={onAdd}>
        <input
          className="input input-bordered join-item w-full"
          placeholder="Название камеры"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn btn-primary join-item" type="submit">
          Добавить
        </button>
      </form>
      <p className="text-sm opacity-70">
        Генератор по умолчанию шлёт deviceId <code>fridge-1</code>. Устройство
        появится автоматически после первого замера.
      </p>
      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <p className="opacity-70">Загрузка…</p> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {devices.map((device) => (
          <Link
            key={device.id}
            to={`/devices/${device.id}`}
            className="card bg-base-100 shadow-sm hover:shadow-md"
          >
            <div className="card-body">
              <div className="flex items-start justify-between gap-2">
                <h2 className="card-title">{device.name}</h2>
                <span className={statusBadge(device.status)}>
                  {STATUS_LABEL[device.status ?? "normal"]}
                </span>
              </div>
              <p>
                {device.lastTemperature !== undefined
                  ? `${device.lastTemperature.toFixed(1)} °C`
                  : "нет замеров"}
              </p>
              <p className="text-sm opacity-70">
                {formatTime(device.lastUpdatedAt)}
              </p>
            </div>
          </Link>
        ))}
      </div>
      {!loading && devices.length === 0 ? (
        <p className="opacity-70">Пока нет камер. Добавьте первую.</p>
      ) : null}
    </section>
  );
}
