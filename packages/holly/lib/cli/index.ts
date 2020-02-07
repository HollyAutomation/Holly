import yargs = require("yargs");
import { run } from "../";
import * as path from "path";
import { Config } from "../types";

module.exports = () => {
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
    },
    retryDelay: {
      type: "string",
      desc:
        "Time to wait between retrying assertions, defaults to '20ms'. Can be a number in ms or a string with unit."
    },
    testTimeout: {
      type: "string",
      desc:
        "Time to wait before failing a test. Defaults to '20s'. Can be a number in ms or a string with unit."
    },
    maxRetryTime: {
      type: "string",
      desc:
        "Amount of time to keep trying a test. Defaults to '5s'. Can be a number in ms or a string with unit."
    }
  }).argv;

  let configOptions: Partial<Config> = {};

  if (commandLineOptions.config) {
    configOptions = require(path.resolve(commandLineOptions.config));
  }

  const specs =
    commandLineOptions.specs || (configOptions && configOptions.specs);

  const commandLineReporters =
    commandLineOptions.reporter && commandLineOptions.reporter.map(String);

  if (!specs) {
    // convert to yargs error?
    throw new Error(
      "You must specify a specs argument or a config file containing specs"
    );
  }

  return run({
    specs,
    reporters: commandLineReporters || configOptions.reporters,
    consistentResultsOrdering: configOptions.consistentResultsOrdering,
    retryDelay: configOptions.retryDelay || commandLineOptions.retryDelay,
    testTimeout: configOptions.testTimeout || commandLineOptions.testTimeout,
    maxRetryTime: configOptions.maxRetryTime || commandLineOptions.maxRetryTime
  });
};
