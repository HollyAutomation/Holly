import "./addHollyToGlobal";
import Debug from "debug";
import defaultMochaOptions = require("mocha/lib/mocharc.json");
import { chromium } from "playwright";
import { Config } from "../types";
import { createMultiReporter } from "../multiReporter";
import globOriginal = require("glob");
import * as util from "util";
import parseTime from "../utils/parseTime";
import runSuite from "../runSuite";

const DEFAULT_TEST_TIMEOUT = parseTime("20s", 0);

const glob = util.promisify(globOriginal);

const debug = Debug("holly:run:index");

export default async (config: Config) => {
  let { specs, reporters, consistentResultsOrdering, testTimeout } = config;

  if (!reporters) {
    reporters = ["spec"];
  }

  const browser = await chromium.launch({ headless: true }); // Or 'firefox' or 'webkit'.
  // or await newContext()
  const context = browser.defaultContext();

  const mochaOptions = {
    ...defaultMochaOptions,
    delay: true, // allow us to control when execution really starts
    timeout: parseTime(testTimeout, DEFAULT_TEST_TIMEOUT)
  };

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
    files.map(file => runSuite(context, config, file, Collector))
  );

  if ((await finished()) > 0) {
    process.exitCode = 1;
  }

  await browser.close();
};
