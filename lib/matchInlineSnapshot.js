const debug = require("debug")("shakespeare:matchInlineSnapshot");
const SHAKESPEARE_INTERNALS_IGNORE = /^\s+at.*?shakespeare(\/|\\)(lib|node_modules)(\/|\\)/;
const StackUtils = require("stack-utils");
const { saveInlineSnapshots } = require("jest-snapshot/build/inline_snapshots");
const babelTraverse = require("@babel/traverse").default;
const prettier = require("prettier");

const removeInternalLines = stackLines => {
  return stackLines.filter(stackLine => {
    if (SHAKESPEARE_INTERNALS_IGNORE.test(stackLine)) {
      return false;
    }
    return true;
  });
};

// stack utils tries to create pretty stack by making paths relative.
const stackUtils = new StackUtils({ cwd: "something which does not exist" });

const getTopFrame = lines => {
  for (const line of lines) {
    const parsedFrame = stackUtils.parseLine(line.trim());

    if (parsedFrame && parsedFrame.file) {
      return parsedFrame;
    }
  }
};

module.exports = {
  name: "shouldMatchInlineSnapshot",
  run(shakespeare, value, stack, snapshot) {
    const serializedValue =
      typeof value === "string" ? "'" + value + "'" : value;

    if (serializedValue !== snapshot) {
      if (!snapshot) {
        const stackLines = removeInternalLines(stack.split("\n"));
        const topFrame = getTopFrame(stackLines);
        if (!topFrame) {
          throw new Error("unable to find location for toMatchSnapshot");
        }
        debug(`getting stack line ${JSON.stringify(topFrame)}`);

        saveInlineSnapshots(
          [{ frame: topFrame, snapshot: serializedValue }],
          prettier,
          babelTraverse
        );
      } else {
        debug(
          `shouldMatchInlineSnapshot not equal '${serializedValue}' '${snapshot}'`
        );
        throw new Error(`expected '${snapshot}' but got '${serializedValue}'`);
      }
    }
  },
  captureStack: true
};
