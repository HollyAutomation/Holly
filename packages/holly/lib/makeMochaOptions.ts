import defaultMochaOptions = require("mocha/lib/mocharc.json");
import parseTime from "./utils/parseTime";
import { Config } from "./types";

const DEFAULT_TEST_TIMEOUT = parseTime("20s", 0);

export default (config: Config): Mocha.MochaOptions => {
  let { testTimeout } = config;

  // @ts-ignore the json imported is not properly typed
  return {
    ...defaultMochaOptions,
    delay: true, // allow us to control when execution really starts
    timeout: parseTime(testTimeout, DEFAULT_TEST_TIMEOUT)
  };
};
