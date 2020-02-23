import Debug from "debug";
import * as wsServer from "./wsServer";
import * as httpServer from "./httpServer";
import { Config } from "../types";
import globOriginal = require("glob");
import * as util from "util";
import { makeMocha } from "../runSuite";
import makeMochaOptions from "../makeMochaOptions";

const debug = Debug("holly:open:index");

const glob = util.promisify(globOriginal);

function getTests(suite: Mocha.Suite): ReadonlyArray<string> {
  let tests = suite.tests.map(test => {
    return test.titlePath().join(" / ");
  });

  suite.suites.forEach(suite => {
    tests = tests.concat(getTests(suite));
  });

  return tests;
}

export default async (config: Config) => {
  let { specs } = config;

  const files = await glob(specs);

  await new Promise(() => {
    // TODO - resolve promise when browser closed? when all connections stop? never?

    httpServer.start();
    wsServer.start({
      getSpecs: () => {
        debug("returning specs");
        return files;
      },
      runSpec: async (spec: string) => {
        if (files.indexOf(spec) < 0) {
          throw new Error("attempt to run a spec not in the list");
        }
        const mocha = makeMocha(
          makeMochaOptions(config),
          // @ts-ignore Fake holly as we just need to iterate the tests
          {},
          spec
        );
        const runner = mocha.run();

        // @ts-ignore
        mocha.unloadFiles();
        const tests = getTests(runner.suite);
        debug(`found ${tests.length} tests`);

        return tests;
      }
    });
  });

  wsServer.stop();
  httpServer.stop();
};
