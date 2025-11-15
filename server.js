import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createBareServer } from "@tomphttp/bare-server-node";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Serve static public UI
app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve UV core files from uvPath under /uv/
app.use('/uv/', express.static(uvPath, { immutable: true, maxAge: '1y' }));

// If local uv files exist in root (copied), serve them too
app.use('/', express.static(path.join(__dirname)));

// Create bare server and mount it at /service
const bare = createBareServer('/bare/');
app.use('/service', (req, res, next) => {
  bare(req, res).catch(next);
});

// Health
app.get('/_health', (req, res) => res.send('ok'));

// Fallback for SPA: serve public index
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = http.createServer(app);
server.on('upgrade', (req, socket, head) => {
  if (bare.shouldRoute(req)) {
    bare.routeUpgrade(req, socket, head);
  } else {
    socket.end();
  }
});
server.listen(port, () => console.log('Server listening on port', port));
