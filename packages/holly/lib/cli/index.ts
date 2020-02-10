import yargs = require("yargs");
import { run, open } from "../";
import * as path from "path";
import { Config } from "../types";

const options = {
  headless: {
    type: "boolean" as yargs.PositionalOptionsType,
    default: true,
    desc:
      "Whether to run in headless mode (no browser visible). Only valid for running tests, not for UI mode."
  },
  config: {
    type: "string" as yargs.PositionalOptionsType,
    alias: "c",
    desc: "Path to a config file for loading"
  },
  specs: {
    type: "string" as yargs.PositionalOptionsType,
    alias: "s",
    desc: "Glob path to specs files to run"
  },
  reporter: {
    type: "array" as "array",
    desc:
      "adds a reporter. Can either be a standard mocha reporter like 'spec' or package to be required"
  },
  retryDelay: {
    type: "string" as yargs.PositionalOptionsType,
    desc:
      "Time to wait between retrying assertions, defaults to '20ms'. Can be a number in ms or a string with unit."
  },
  testTimeout: {
    type: "string" as yargs.PositionalOptionsType,
    desc:
      "Time to wait before failing a test. Defaults to '20s'. Can be a number in ms or a string with unit."
  },
  maxRetryTime: {
    type: "string" as yargs.PositionalOptionsType,
    desc:
      "Amount of time to keep trying a test. Defaults to '5s'. Can be a number in ms or a string with unit."
  }
};

const getConfig = (commandLineOptions: CommandLineOptions) => {
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

  return {
    specs,
    reporters: commandLineReporters || configOptions.reporters,
    consistentResultsOrdering: configOptions.consistentResultsOrdering,
    retryDelay: commandLineOptions.retryDelay || configOptions.retryDelay,
    testTimeout: commandLineOptions.testTimeout || configOptions.testTimeout,
    maxRetryTime: commandLineOptions.maxRetryTime || configOptions.maxRetryTime
  };
};

interface CommandLineOptions {
  config?: string;
  retryDelay?: string;
  testTimeout?: string;
  maxRetryTime?: string;
  reporter?: Array<number | string>;
  specs?: string;
  headless?: boolean;
}

module.exports = () => {
  let commandPromise;
  yargs
    .command(
      "open",
      "Opens the UI",
      options,
      // @ts-ignore yargs typing doesnt work with commands and shared options
      (commandLineOptions: CommandLineOptions) => {
        const config = getConfig(commandLineOptions);
        commandPromise = open(config);
        return commandPromise;
      }
    )
    .command(
      ["run", "$0"],
      "Runs the specs",
      options,
      (commandLineOptions: CommandLineOptions) => {
        const config = getConfig(commandLineOptions);
        commandPromise = run(config);
        return commandPromise;
      }
    ).argv;
  return commandPromise;
};
