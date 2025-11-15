import express from 'express';
import { createBareServer } from '@tomphttp/bare-server-node';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 8080;

const bare = createBareServer('/bare/');

app.use(express.static(__dirname));

const serverInst = app.listen(port, () => console.log("OK:" + port));

serverInst.on('upgrade', (req, socket, head) => {
  if (bare.shouldRoute(req)) bare.routeUpgrade(req, socket, head);
});

app.use((req,res,next)=>{
 if (bare.shouldRoute(req)) return bare.routeRequest(req,res);
 next();
});
