import Koa = require("koa");
import KoaStatic = require("koa-static");
import Debug from "debug";
import { Server } from "http";
import * as path from "path";

const debug = Debug("holly:open:httpServer");

let server: Server;

export const start = () => {
  const app = new Koa();
  const staticPath = path.join(
    path.dirname(require.resolve("holly-ui")),
    "build"
  );
  debug(`Startng http server on path ${staticPath}`);
  app.use(KoaStatic(staticPath, {}));
  app.listen(4000);
};
export const stop = () => {
  server.close();
};
