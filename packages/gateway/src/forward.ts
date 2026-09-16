import type { Reading } from "@cold/shared";
import { io, type Socket } from "socket.io-client";
import type { GatewayConfig } from "./config.js";

export interface ServerForwarder {
  send(reading: Reading): Promise<void>;
  close(): void;
}

export function createServerForwarder(config: GatewayConfig): ServerForwarder {
  const socket: Socket = io(config.socketUrl, {
    autoConnect: true,
    reconnection: true,
    extraHeaders: {
      "x-gateway-token": config.token,
    },
  });

  socket.on("connect_error", (error: Error) => {
    console.error(`[gateway] socket.io: ${error.message}`);
  });

  return {
    async send(reading) {
      try {
        const response = await fetch(`${config.apiUrl}/api/readings`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-gateway-token": config.token,
          },
          body: JSON.stringify(reading),
        });
        if (response.ok) {
          return;
        }
        console.warn(
          `[gateway] HTTP ${response.status}, пробуем reading:ingest`,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[gateway] HTTP недоступен (${message}), пробуем socket`);
      }

      await new Promise<void>((resolve, reject) => {
        if (!socket.connected) {
          reject(new Error("Socket.IO не подключён"));
          return;
        }
        socket.timeout(4000).emit("reading:ingest", reading, (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        });
      });
    },
    close() {
      socket.close();
    },
  };
}
