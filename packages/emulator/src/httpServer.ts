import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";
import type { SensorIngest } from "./ingest.js";
import { IngestValidationError, validateReading } from "./validate.js";

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,OPTIONS",
  });
  res.end(payload);
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function broadcast(wss: WebSocketServer, payload: string): void {
  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(payload);
    }
  }
}

export function startEmulatorServer(
  ingest: SensorIngest,
  port: number,
  host = "127.0.0.1",
): Promise<{ close: () => Promise<void> }> {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      void handleHttp(req, res, ingest);
    });
    const wss = new WebSocketServer({ server });

    const unsubscribe = ingest.onReading((reading) => {
      broadcast(wss, JSON.stringify(reading));
    });

    wss.on("connection", (socket: WebSocket) => {
      socket.on("message", (raw) => {
        try {
          const parsed: unknown = JSON.parse(String(raw));
          void ingest.push(validateReading(parsed));
        } catch (error) {
          const message = error instanceof Error ? error.message : "Некорректный кадр";
          socket.send(JSON.stringify({ error: message }));
        }
      });
    });

    server.once("error", reject);
    // В Docker нужен 0.0.0.0, локально по умолчанию loopback
    server.listen(port, host, () => {
      resolve({
        async close() {
          unsubscribe();
          await new Promise<void>((done, fail) => {
            wss.close((err) => {
              if (err) fail(err);
              else server.close((serverErr) => (serverErr ? fail(serverErr) : done()));
            });
          });
        },
      });
    });
  });
}

async function handleHttp(
  req: IncomingMessage,
  res: ServerResponse,
  ingest: SensorIngest,
): Promise<void> {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");

  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, { ok: true, service: "emulator" });
    return;
  }

  if (req.method === "POST" && url.pathname === "/ingest") {
    try {
      const raw = await readBody(req);
      const parsed: unknown = JSON.parse(raw || "{}");
      const reading = validateReading(parsed);
      await ingest.push(reading);
      sendJson(res, 202, { ok: true, reading });
    } catch (error) {
      const status = error instanceof IngestValidationError ? 400 : 500;
      const message = error instanceof Error ? error.message : "Ошибка ingest";
      sendJson(res, status, { error: message });
    }
    return;
  }

  sendJson(res, 404, { error: "Не найдено" });
}
