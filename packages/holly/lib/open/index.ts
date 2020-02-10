import * as wsServer from "./wsServer";
import { Config } from "../types";
import globOriginal = require("glob");
import * as util from "util";

const glob = util.promisify(globOriginal);

export default async (config: Config) => {
  let { specs } = config;

  const files = await glob(specs);

  await new Promise(() => {
    // TODO - resolve promise when browser closed? when all connections stop? never?

    wsServer.start({
      getSpecs: () => {
        return files;
      }
    });
  });

  wsServer.stop();
};
