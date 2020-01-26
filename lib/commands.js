const debug = require("debug")("shakespeare:commands");
const matchInlineSnapshot = require("./matchInlineSnapshot");

exports.rootCommands = [
  {
    name: "$",
    run(shakespeare, selector) {
      return shakespeare.__page.$(selector);
    }
  },
  {
    name: "newPage",
    async run(shakespeare, url) {
      const page = await shakespeare.__context.newPage("about:blank");
      shakespeare.__page = page;
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
    run(shakespeare, element) {
      return element.evaluate(elem => elem.value);
    }
  },
  {
    name: "shouldEqual",
    run(shakespeare, value, expectedValue) {
      if (value !== expectedValue) {
        debug(`shouldEqual not equal '${value}' '${expectedValue}'`);
        throw new Error(`expected '${expectedValue}' but got '${value}'`);
      }
    }
  },
  matchInlineSnapshot,
  {
    name: "type",
    run(shakespeare, element, value) {
      return element.type(value);
    },
    canRetry: false
  }
];
