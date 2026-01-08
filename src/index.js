import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

import socketManager from "./sockets/socketManager.js";

import { pubClient, subClient } from "./config/redis.js";

const app = express();
const server = createServer(app);

async function startServer() {
  try {
    await Promise.all([pubClient.connect(), subClient.connect()]);
    console.log("Redis connected");

    const io = new Server(server, {
      cors: { origin: "*" },
      adapter: createAdapter(pubClient, subClient),
    });

    app.set("io", io);

    socketManager(io);

    server.listen(4000, () => {
      console.log("Server listening on *:4000");
    });
  } catch (e) {
    console.error("Failed to start server:", e);
  }
}

await startServer();
