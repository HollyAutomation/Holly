import "./addHollyToGlobal";
import Debug from "debug";
import Mocha = require("mocha");
import defaultMochaOptions = require("mocha/lib/mocharc.json");
import { chromium } from "playwright";
import createHolly from "./holly";
import { Holly, Config } from "./types";
import { createMultiReporter } from "./multiReporter";
import globOriginal = require("glob");
import * as util from "util";
import * as path from "path";
import parseTime from "./utils/parseTime";

const DEFAULT_TEST_TIMEOUT = parseTime("20s", 0);

const glob = util.promisify(globOriginal);

const debug = Debug("holly:index");

function getHollyFromSuite(suite: Mocha.Suite): Holly {
  while (suite.parent) {
    suite = suite.parent;
  }
  // @ts-ignore
  return suite.holly;
}

// patch mocha to use the state engine to run the test
// The event is deprecated and we need to alter the function
// so it returns a promise.
const oldAddTest = Mocha.Suite.prototype.addTest;
// This intercepts when the test is added, after a runnable is created
Mocha.Suite.prototype.addTest = function(test: Mocha.ITest) {
  const holly = getHollyFromSuite(this);
  const oldFn = test.fn;
  if (oldFn) {
    test.fn = async function() {
      await oldFn.call(this);
      return holly.__executeSoFar();
    };
    // tests returning promises are classed as sync
    // and mocha may detect this as async because of the passed
    // argument
    test.async = false;
    test.sync = true;
  }
  return oldAddTest.call(this, test);
};

const oldBeforeEach = Mocha.Suite.prototype.beforeEach;
// this function adds a fn as a beforeEach hook.
// the code intercepts it before a runnable is created
Mocha.Suite.prototype.beforeEach = function(
  titleOrFunc?: Mocha.Func | string,
  maybeFunc?: Mocha.Func
) {
  let fn: Mocha.Func | void;
  let title: string;
  if (typeof titleOrFunc === "function") {
    fn = titleOrFunc;
    title = fn.name;
  } else {
    fn = maybeFunc;
    title = titleOrFunc || "";
  }
  if (!fn) {
    // @ts-ignore
    return oldBeforeEach.call(this, titleOrFunc, maybeFunc);
  }
  const holly = getHollyFromSuite(this);
  return oldBeforeEach.call(this, title, async function() {
    debug("calling beforeEach fn");
    // @ts-ignore
    await fn.call(this);
    return holly.__executeSoFar();
  });
};

const oldAfterEach = Mocha.Suite.prototype.afterEach;
// this function adds a fn as a afterEach hook.
// the code intercepts it before a runnable is created
Mocha.Suite.prototype.afterEach = function(
  titleOrFunc?: Mocha.Func | string,
  maybeFunc?: Mocha.Func
) {
  let fn: Mocha.Func | void;
  let title: string;
  if (typeof titleOrFunc === "function") {
    fn = titleOrFunc;
    title = fn.name;
  } else {
    fn = maybeFunc;
    title = titleOrFunc || "";
  }
  if (!fn) {
    // @ts-ignore
    return oldAfterEach.call(this, titleOrFunc, maybeFunc);
  }

  const holly = getHollyFromSuite(this);
  return oldAfterEach.call(this, title, async function() {
    debug("calling afterEach fn");
    // @ts-ignore
    await fn.call(this);
    return holly.__executeSoFar();
  });
};

// @ts-ignore
const oldFail = Mocha.Runner.prototype.fail;
// @ts-ignore
Mocha.Runner.prototype.fail = function(test, err) {
  if (!test.isPending() && err && err.stack) {
    const slash = path.sep;
    const cwd = process.cwd() + slash;

    const isInternal = (line: string) => {
      return (
        line.indexOf("node_modules" + slash + "holly" + slash) >= 0 ||
        line.match(/\(internal(\/|\\)/) ||
        (Number(process.env.HOLLY_INT_TEST) > 0 &&
          (line.indexOf(cwd + "build" + slash) >= 0 ||
            line.indexOf(cwd + "lib" + slash) >= 0))
      );
    };

    err.stack = err.stack
      .split("\n")
      .filter((stackLine: string) => !isInternal(stackLine))
      .join("\n");
  }
  return oldFail.call(this, test, err);
};

export const run = async (config: Config) => {
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

  const runSuite = (suiteFile: string, Collector: ReporterConstructor) => {
    return new Promise(resolve => {
      const holly = createHolly(config);

      // @ts-ignore
      const mocha = new Mocha(mochaOptions);
      mocha.reporter(Collector);

      // @ts-ignore
      mocha.suite.holly = holly;

      mocha.addFile(suiteFile);

      mocha.suite.on(
        Mocha.Suite.constants.EVENT_FILE_PRE_REQUIRE,
        (context: any) => {
          // @ts-ignore
          context.getHolly = () => holly;
        }
      );

      mocha.suite.on(
        Mocha.Suite.constants.EVENT_FILE_POST_REQUIRE,
        (context: any) => {
          // @ts-ignore
          context.getHolly = null;
        }
      );

      const runner = mocha.run(async () => {
        if (holly.__page) {
          await holly.__page.close();
        }
        resolve();
      });

      runner.on(Mocha.Runner.constants.EVENT_TEST_BEGIN, function() {
        debug("test start");
        holly.__start(context);
      });

      mocha.suite.emit(Mocha.Suite.constants.EVENT_ROOT_SUITE_RUN);
    });
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

  await Promise.all(files.map(file => runSuite(file, Collector)));

  await finished();

  await browser.close();
};
