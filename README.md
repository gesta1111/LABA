# ХолодМонитор

Монорепозиторий лабораторного комплекса: генератор случайных температур → эмулятор датчика → шлюз → backend → PWA.

## Порты

| Сервис | Порт |
| --- | --- |
| Frontend (Vite) | 5173 |
| Backend (Fastify + Socket.IO) | 5050 |
| Эмулятор датчика (WS + HTTP `/ingest`) | 5051 |
| MongoDB | 27017 |

## Запуск

1. Поднимите MongoDB локально (`mongodb://127.0.0.1:27017/coldmonitor`) или укажите URI Atlas.
2. Скопируйте переменные окружения:

```sh
cp .env.example .env
cp .env.example apps/server/.env
```

3. Установите зависимости и соберите пакеты:

```sh
npm install
npm run build
```

4. Запустите web, server, emulator и gateway параллельно:

```sh
npm run dev
```

5. Чтобы пошли числа, в другом терминале запустите генератор:

```sh
turbo run dev --filter=@cold/generator
```

По умолчанию генератор шлёт `deviceId=fridge-1` в эмулятор. Камера появится в UI после первого замера. Несколько камер: `DEVICE_IDS=fridge-1,fridge-2`.

Интервал генератора: `INTERVAL_MS` (по умолчанию 2000).
