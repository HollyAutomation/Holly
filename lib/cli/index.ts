import yargs = require("yargs");
import { run } from "../";
import * as path from "path";

const commandLineOptions = yargs.options({
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
    desc: "Glob path to specs files to run"
  },
  reporter: {
    type: "array",
    desc:
      "adds a reporter. Can either be a standard mocha reporter like 'spec' or package to be required"
  }
}).argv;

let configOptions = {};

if (commandLineOptions.config) {
  configOptions = require(path.resolve(commandLineOptions.config));
}

const options = { ...configOptions, ...commandLineOptions };

if (!options.specs) {
  // convert to yargs error?
  throw new Error(
    "You must specify a specs argument or a config file containing specs"
  );
}

run({
  specs: options.specs
});
