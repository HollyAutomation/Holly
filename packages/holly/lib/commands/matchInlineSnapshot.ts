import Debug from "debug";
import StackUtils = require("stack-utils");
import { saveInlineSnapshots } from "jest-snapshot/build/inline_snapshots";
import babelTraverse from "@babel/traverse";
import prettier = require("prettier");
import { CommandDefinition } from "../types";

const debug = Debug("holly:commands:matchInlineSnapshot");
const holly_INTERNALS_IGNORE = /^\s+at.*?holly(\/|\\)(build|node_modules)(\/|\\)/i;

const removeInternalLines = (stackLines: ReadonlyArray<string>) => {
  return stackLines.filter((stackLine: string) => {
    if (holly_INTERNALS_IGNORE.test(stackLine)) {
      return false;
    }
    return true;
  });
};

// stack utils tries to create pretty stack by making paths relative.
const stackUtils = new StackUtils({ cwd: "something which does not exist" });

const getTopFrame = (lines: ReadonlyArray<string>) => {
  for (const line of lines) {
    const parsedFrame = stackUtils.parseLine(line.trim());

    if (parsedFrame && parsedFrame.file) {
      return parsedFrame;
    }
  }
};

export default {
  name: "shouldMatchInlineSnapshot",
  async run({ commandInstance }, value: any, snapshot: string) {
    const snapshotFormatted =
      snapshot && JSON.stringify(JSON.parse(snapshot), null, 4);
    const serializedValue = JSON.stringify(value, null, 4);

    if (serializedValue !== snapshotFormatted) {
      if (!snapshot) {
        // TODO do this properly and test
        // @ts-ignore
        if (!commandInstance.isSnapshotWaitDone) {
          console.log("waiting...");
          await new Promise(resolve => setTimeout(resolve, 2000));
          // @ts-ignore
          commandInstance.isSnapshotWaitDone = true;
          console.log("erroring to retry");
          throw new Error("erroring in order to retry");
        }
        const stackLines = removeInternalLines(
          commandInstance.stack.split("\n")
        );
        const topFrame = getTopFrame(stackLines);
        if (!topFrame || !topFrame.file) {
          throw new Error("unable to find location for toMatchSnapshot");
        }
        debug(`getting stack line ${JSON.stringify(topFrame)}`);

        // TODO this must be done all at the end
        saveInlineSnapshots(
          // @ts-ignore
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
} as CommandDefinition;
