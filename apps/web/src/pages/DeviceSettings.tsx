import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Device } from "@cold/shared";
import { api } from "../api.ts";

export function DeviceSettings() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [device, setDevice] = useState<Device | null>(null);
  const [name, setName] = useState("");
  const [minC, setMinC] = useState("2");
  const [maxC, setMaxC] = useState("8");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void api
      .devices()
      .then((list) => {
        const found = list.find((item) => item.id === id) ?? null;
        setDevice(found);
        if (found) {
          setName(found.name);
          setMinC(String(found.minC));
          setMaxC(String(found.maxC));
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Ошибка загрузки");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  async function onSave(event: FormEvent) {
    event.preventDefault();
    try {
      const updated = await api.updateDevice(id, {
        name,
        minC: Number(minC),
        maxC: Number(maxC),
      });
      setDevice(updated);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить");
    }
  }

  async function onDelete() {
    if (!window.confirm("Удалить камеру?")) return;
    await api.deleteDevice(id);
    navigate("/");
  }

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
    <section className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-semibold">Настройки</h1>
      {error ? <div className="alert alert-error">{error}</div> : null}
      <form className="card bg-base-100 shadow-sm" onSubmit={onSave}>
        <div className="card-body space-y-3">
          <label className="form-control">
            <span className="label-text">Название</span>
            <input
              className="input input-bordered"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="form-control">
            <span className="label-text">Единицы измерения</span>
            <input className="input input-bordered" value="°C" readOnly />
          </label>
          <label className="form-control">
            <span className="label-text">Минимум, °C</span>
            <input
              className="input input-bordered"
              type="number"
              step="0.1"
              value={minC}
              onChange={(e) => setMinC(e.target.value)}
            />
          </label>
          <label className="form-control">
            <span className="label-text">Максимум, °C</span>
            <input
              className="input input-bordered"
              type="number"
              step="0.1"
              value={maxC}
              onChange={(e) => setMaxC(e.target.value)}
            />
          </label>
          <div className="card-actions justify-between">
            <Link className="btn btn-ghost" to={`/devices/${id}`}>
              Назад
            </Link>
            <button className="btn btn-primary" type="submit">
              Сохранить
            </button>
          </div>
        </div>
      </form>
      <button className="btn btn-error" type="button" onClick={() => void onDelete()}>
        Удалить
      </button>
    </section>
  );
}
