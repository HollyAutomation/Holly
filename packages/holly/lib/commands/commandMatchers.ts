import Debug from "debug";
import { ChainedCommandDefinition, CommandResult } from "../types";
import rawMatchers from "./matchers";
import * as jestAsymmetricMatchers from "expect/build/asymmetricMatchers";
import { assertValueType } from "../utils/assert";

const debug = Debug("holly:commandMatchers");

export const asymmetricMatchers = Object.keys(jestAsymmetricMatchers).reduce(
  (
    matchers: { [name: string]: (any: any) => any },
    matcherName: string | void
  ) => {
    if (matcherName && matcherName !== "AsymmetricMatcher") {
      // @ts-ignore
      matchers[matcherName] = jestAsymmetricMatchers[matcherName];
    }
    return matchers;
  },
  {}
);

function createMatcherCommand(
  name: string,
  alias: string,
  isNegative?: boolean
): ChainedCommandDefinition {
  return {
    name: alias,
    run(
      _,
      commandResult: CommandResult,
      expectedValue: any,
      ...otherArgs: ReadonlyArray<any>
    ): CommandResult {
      assertValueType(commandResult, alias);

      const receivedValue = commandResult.value;

      const matcherState = {
        isNot: Boolean(isNegative),
        expand: false
      };

      const result = rawMatchers[name].call(
        matcherState,
        alias,
        receivedValue,
        expectedValue,
        ...otherArgs
      );
      // @ts-ignore we won't get a async result here
      let pass = result.pass;
      if (isNegative) {
        pass = !pass;
      }
      if (!pass) {
        debug(`matcher failed '${receivedValue}' '${expectedValue}'`);
        throw result;
      }
      debug(`matcher passed '${receivedValue}' '${expectedValue}'`);
      return commandResult;
    }
  };
}

export const commandMatchers = Object.keys(rawMatchers).reduce(
  (allMatchers: Array<ChainedCommandDefinition>, rawName) => {
    const positiveAlias = rawName.replace("to", "should");
    allMatchers.push(createMatcherCommand(rawName, positiveAlias, false));
    const negativeAlias = rawName.replace("to", "shouldNot");
    allMatchers.push(createMatcherCommand(rawName, negativeAlias, true));
    return allMatchers;
  },
  []
);
