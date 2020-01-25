const Mocha = require("mocha");
//const playwright = require("playwright");
const createShakespeare = require("./shakespeare");

global.sp = createShakespeare();

// patch mocha to use the state engine to run the test
// The event is deprecated and we need to alter the function
// so it returns a promise.
const oldAddTest = Mocha.Suite.prototype.addTest;
Mocha.Suite.prototype.addTest = function(...args) {
  const test = args[0];
  const oldFn = test.fn;
  test.fn = function() {
    oldFn();
    return sp.__executeSoFar();
  };
  return oldAddTest.apply(this, args);
};

const oldBeforeEach = Mocha.Suite.prototype.beforeEach;
Mocha.Suite.prototype.beforeEach = function(title, fn) {
  return oldBeforeEach.call(this, title, async function(...args) {
    await fn.apply(this, args);
    return sp.__executeSoFar();
  });
};

const oldAfterEach = Mocha.Suite.prototype.afterEach;
Mocha.Suite.prototype.afterEach = function(title, fn) {
  return oldAfterEach.call(this, title, async function(...args) {
    await fn.apply(this, args);
    return sp.__executeSoFar();
  });
};

const mocha = new Mocha({
  delay: true // allow us to control when execution really starts
});

mocha.addFile("integration/test.spec.js");

const runner = mocha.run();

runner.on(Mocha.Runner.constants.EVENT_TEST_BEGIN, function(test) {
  sp.__start();
});

mocha.suite.emit(Mocha.Suite.constants.EVENT_ROOT_SUITE_RUN);