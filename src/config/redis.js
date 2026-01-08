import { createClient } from "redis";

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

pubClient.on("error", (err) => console.error("Redis Pub Error", err));
subClient.on("error", (err) => console.error("Redis Sub Error", err));

export { pubClient, subClient };
