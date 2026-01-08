import express from "express";
import http from "http";

import { pubClient, subClient } from "./config/redis.js";

const app = express();
const server = http.createServer(app);

async function startServer() {
  try {
    await Promise.all([pubClient.connect(), subClient.connect()]);
    console.log("Redis connected");

    server.listen(4000, () => {
      console.log("Server listening on *:4000");
    });
  } catch (e) {
    console.error("Failed to start server:", e);
  }
}

await startServer();
