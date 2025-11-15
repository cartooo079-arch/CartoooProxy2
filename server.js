
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import UV from "@titaniumnetwork-dev/ultraviolet";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// UV backend setup
const uv = new UV({
    prefix: "/uv/service/",
    bare: "https://raw.githubusercontent.com/tomphttp/bare-server-node/master/src/",
});

app.use("/uv/service/", uv.handle());
app.use("/uv/rewrites/", uv.rewrite());
app.use("/uv/sw.js", (req, res) =>
    res.sendFile(path.join(__dirname, "uv", "sw.js"))
);
app.use("/uv/uv.config.js", (req, res) =>
    res.sendFile(path.join(__dirname, "uv", "uv.config.js"))
);

// Serve public UI
app.use(express.static(path.join(__dirname, "public")));

// Serve UV static
app.use("/uv/", express.static(path.join(__dirname, "uv")));

// Fallback
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log("Running on port " + PORT));
