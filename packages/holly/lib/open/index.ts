import globOriginal = require("glob");
import { chromium } from "playwright";
import Debug from "debug";
import * as wsServer from "./wsServer";
import * as httpServer from "./httpServer";
import { Config } from "../types";
import * as util from "util";
import runSuite, { makeMocha } from "../runSuite";
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

  const browser = await chromium.launch({
    headless: process.env.HOLLY_FORCE_HEADLESS ? true : false
  }); // Or 'firefox' or 'webkit'.
  // TODO: Work out how to deal with contexts
  const context = await browser.newContext();

  const mochaOptions = makeMochaOptions(config);
  let currentSpec: string;

  await new Promise(() => {
    // TODO - resolve promise when browser closed? when all connections stop? never?

    httpServer.start();
    wsServer.start({
      getSpecs() {
        debug("returning specs");
        return files;
      },
      async openSpec(spec: string) {
        if (files.indexOf(spec) < 0) {
          throw new Error("attempt to run a spec not in the list");
        }
        currentSpec = spec;
        const mocha = makeMocha(
          mochaOptions,
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
      },
      run() {
        runSuite(mochaOptions, context, config, currentSpec);
      }
    });
  });

  wsServer.stop();
  httpServer.stop();
};
