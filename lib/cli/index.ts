import yargs = require("yargs");
import { run } from "../";

const options = yargs.options({
  headless: {
    type: "boolean",
    default: true,
    desc:
      "Whether to run in headless mode (no browser visible). Only valid for running tests, not for UI mode."
  },
  config: {
    type: "string",
    alias: "c",
    desc: "Path to a config file for loading"
  },
  specs: {
    type: "string",
    alias: "s",
    demandOption: true,
    desc: "Glob path to specs files to run"
  },
  reporter: {
    type: "array",
    desc:
      "adds a reporter. Can either be a standard mocha reporter like 'spec' or package to be required"
  }
}).argv;

run({
  specs: options.specs
});
