import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createHttpServer } from "http";
import { createBareServer, uvPath } from "@titaniumnetwork-dev/ultraviolet";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, "."), { index: "index.html" }));

// Serve UV core files at /uv/
app.use("/uv/", express.static(uvPath, { immutable: true, maxAge: "1y" }));

// Mount Bare server at /service
const bare = createBareServer("/bare/");
app.use("/service", (req, res, next) => {
    bare(req, res).catch(next);
});

app.get("/_health", (req, res) => res.send("ok"));

const port = process.env.PORT || 3000;
createHttpServer(app).listen(port, () => {
    console.log("Server running on port " + port);
});
