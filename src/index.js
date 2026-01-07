import express from "express";
import { createClient } from "redis";
import http from "http";

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

const app = express();
const server = http.createServer(app);

server.listen(4000, () => {
  console.log("Server listening on *:4000");
});
