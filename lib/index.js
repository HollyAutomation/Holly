const debug = require("debug")("holly:index");
const Mocha = require("mocha");
const { chromium } = require("playwright");
const createHolly = require("./holly");

const holly = createHolly();

// patch mocha to use the state engine to run the test
// The event is deprecated and we need to alter the function
// so it returns a promise.
const oldAddTest = Mocha.Suite.prototype.addTest;
// This intercepts when the test is added, after a runnable is created
Mocha.Suite.prototype.addTest = function(...args) {
  const test = args[0];
  const oldFn = test.fn;
  test.fn = async function() {
    await oldFn.call(this, holly);
    return holly.__executeSoFar();
  };
  // tests returning promises are classed as sync
  // and mocha may detect this as async because of the passed
  // argument
  test.async = false;
  test.sync = true;
  return oldAddTest.apply(this, args);
};

const oldBeforeEach = Mocha.Suite.prototype.beforeEach;
// this function adds a fn as a beforeEach hook.
// the code intercepts it before a runnable is created
Mocha.Suite.prototype.beforeEach = function(title, fn) {
  if (typeof title === "function") {
    fn = title;
    title = fn.name;
  }
  return oldBeforeEach.call(this, title, async function() {
    debug("calling beforeEach fn");
    await fn.call(this, holly);
    return holly.__executeSoFar();
  });
};

const oldAfterEach = Mocha.Suite.prototype.afterEach;
// this function adds a fn as a afterEach hook.
// the code intercepts it before a runnable is created
Mocha.Suite.prototype.afterEach = function(title, fn) {
  if (typeof title === "function") {
    fn = title;
    title = fn.name;
  }
  return oldAfterEach.call(this, title, async function() {
    debug("calling afterEach fn");
    await fn.call(this, holly);
    return holly.__executeSoFar();
  });
};

(async () => {
  const mocha = new Mocha({
    delay: true, // allow us to control when execution really starts
    timeout: "20s"
  });

  mocha.addFile("integration/test.spec.js");

  const browser = await chromium.launch({ headless: false }); // Or 'firefox' or 'webkit'.
  // or await newContext()
  const context = browser.defaultContext();

  const runner = mocha.run(async () => {
    if (holly.__page) {
      await holly.__page.close();
    }
    await browser.close();
  });

  runner.on(Mocha.Runner.constants.EVENT_TEST_BEGIN, function(test) {
    debug("test start");
    holly.__start(context);
  });

  mocha.suite.emit(Mocha.Suite.constants.EVENT_ROOT_SUITE_RUN);
})();
