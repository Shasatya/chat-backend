import express, { json } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";

dotenv.config();

import apiRoutes from "./routes/api.js";
import socketManager from "./sockets/socketManager.js";

import { pubClient, subClient } from "./config/redis.js";

const app = express();
const server = createServer(app);

app.use(helmet());
app.use(cors());
app.use(json());

app.use((req, res, next) => {
  console.log("REQUEST HIT BACKEND:", req.method, req.url);
  next();
});

app.use("/api", apiRoutes);

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

startServer();
