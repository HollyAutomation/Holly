import "../addHollyToGlobal";
import Debug from "debug";
import defaultMochaOptions = require("mocha/lib/mocharc.json");
import { chromium } from "playwright";
import { Config } from "../types";
import { createMultiReporter } from "../multiReporter";
import globOriginal = require("glob");
import * as util from "util";
import runSuite from "../runSuite";
import makeMochaOptions from "../makeMochaOptions";

const glob = util.promisify(globOriginal);

const debug = Debug("holly:run:index");

export default async (config: Config) => {
  let { specs, reporters, consistentResultsOrdering, testTimeout } = config;

  if (!reporters) {
    reporters = ["spec"];
  }

  const browser = await chromium.launch({ headless: true }); // Or 'firefox' or 'webkit'.
  // TODO: Work out how to deal with contexts
  const context = await browser.newContext();

  const mochaOptions = makeMochaOptions(config);

  const { Collector, addReporter, start, finished } = createMultiReporter(
    consistentResultsOrdering
  );

  reporters.forEach((reporter: string) =>
    addReporter(reporter, undefined, mochaOptions)
  );

  start();

  const files = await glob(specs);

  debug("Testing files..", files);

  await Promise.all(
    files.map(file => runSuite(mochaOptions, context, config, file, Collector))
  );

  if ((await finished()) > 0) {
    process.exitCode = 1;
  }

  await browser.close();
};
