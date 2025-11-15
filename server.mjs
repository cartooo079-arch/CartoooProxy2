import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import createBareServer from "@tomphttp/bare-server-node";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

// serve static files (index.html, uv.html, uv bundle files etc)
app.use(express.static(path.join(__dirname), { index: "index.html" }));

// serve ultraviolet core at /uv/
app.use("/uv/", express.static(uvPath, { immutable: true, maxAge: "1y" }));

// create bare server (handles ws/upgrades)
const bare = createBareServer("/bare/");

// expose the bare API under /service (client may request /service or /bare/)
app.use("/service", (req, res, next) => {
  // route normal HTTP requests to the bare server
  bare(req, res).catch(next);
});

// health check
app.get("/_health", (req, res) => res.send("ok"));

// fallback to index.html for SPA routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// create http server and attach upgrade handler for websockets
const server = http.createServer(app);

server.on("upgrade", (req, socket, head) => {
  if (bare.shouldRoute(req)) {
    bare.routeUpgrade(req, socket, head);
  } else {
    socket.end();
  }
});

server.listen(port, () => {
  // keep logs minimal — Koyeb will show them
  console.log("Server listening on port", port);
});
