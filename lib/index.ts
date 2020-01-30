import Debug from "debug";
import Mocha = require("mocha");
import { chromium } from "playwright";
import createHolly from "./holly";
import { Holly } from "./types";

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
      await oldFn.call(this, holly);
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
    await fn.call(this, holly);
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
    await fn.call(this, holly);
    return holly.__executeSoFar();
  });
};

(async () => {
  const browser = await chromium.launch({ headless: false }); // Or 'firefox' or 'webkit'.
  // or await newContext()
  const context = browser.defaultContext();

  const runSuite = (suiteFile: string) => {
    return new Promise(resolve => {
      const holly = createHolly();

      const mocha = new Mocha({
        delay: true, // allow us to control when execution really starts
        timeout: "20s"
      });

      // @ts-ignore
      mocha.suite.holly = holly;

      mocha.addFile(suiteFile);

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

  await Promise.all([
    runSuite("integration/inlineSnapshot.spec.js"),
    runSuite("integration/matchers.spec.js")
  ]);

  await browser.close();
})();
