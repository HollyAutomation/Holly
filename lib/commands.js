const debug = require("debug")("holly:commands");
const matchInlineSnapshot = require("./matchInlineSnapshot");

exports.rootCommands = [
  {
    name: "$",
    run(holly, selector) {
      return holly.__page.$(selector);
    }
  },
  {
    name: "newPage",
    async run(holly, url) {
      const page = await holly.__context.newPage("about:blank");
      holly.__page = page;
      // here would go coverage etc.
      await page.goto(url);
      return page;
    },
    canRetry: false
  }
];
exports.chainedCommands = [
  {
    name: "value",
    run(holly, element) {
      return element.evaluate(elem => elem.value);
    }
  },
  {
    name: "shouldEqual",
    run(holly, value, expectedValue) {
      if (value !== expectedValue) {
        debug(`shouldEqual not equal '${value}' '${expectedValue}'`);
        throw new Error(`expected '${expectedValue}' but got '${value}'`);
      }
    }
  },
  matchInlineSnapshot,
  {
    name: "type",
    run(holly, element, value) {
      return element.type(value);
    },
    canRetry: false
  }
];
