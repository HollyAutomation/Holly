import Mocha = require("mocha");
import Debug from "debug";
import { Holly } from "./types";
import * as path from "path";

const debug = Debug("holly:patchMocha");

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
