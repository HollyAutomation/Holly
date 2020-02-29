import globOriginal = require("glob");
import { chromium } from "playwright";
import Debug from "debug";
import { Action } from "redux";
import * as wsServer from "./wsServer";
import * as httpServer from "./httpServer";
import { Config } from "../types";
import * as util from "util";
import runSuite, { makeMocha } from "../runSuite";
import makeMochaOptions from "../makeMochaOptions";
import createStore from "./store";
import { actions } from "../../../holly-shared";

const debug = Debug("holly:open:index");

const glob = util.promisify(globOriginal);

function getTests(suite: Mocha.Suite): ReadonlyArray<string> {
  let tests = suite.tests.map(test => {
    return test.titlePath().join(" / ");
  });

  suite.suites.forEach(suite => {
    tests = tests.concat(getTests(suite));
  });

  return tests;
}

export default async (config: Config) => {
  let { specs } = config;

  httpServer.start();
  const { send, finishedPromise } = wsServer.start({
    getState() {
      return store.getState();
    },
    dispatch(action: Action) {
      if (actions.currentSpec.setFile.match(action)) {
        if (store.getState().specFiles.indexOf(action.payload) < 0) {
          throw new Error("attempt to run a spec not in the list");
        }
        const currentSpec = action.payload;
        const mocha = makeMocha(
          mochaOptions,
          // @ts-ignore Fake holly as we just need to iterate the tests
          {},
          currentSpec
        );
        const runner = mocha.run();

        // @ts-ignore
        mocha.unloadFiles();
        const tests = getTests(runner.suite);
        debug(`found ${tests.length} tests`);

        store.dispatch(action);
        store.dispatch(actions.currentSpec.setTests(tests));
        return;
      }
      if (actions.currentSpec.run.match(action)) {
        store.dispatch(action);
        const file = store.getState().currentSpec.file;
        if (file) {
          runSuite(mochaOptions, context, config, file);
        }
        return;
      }
      store.dispatch(action);
    }
  });

  const store = createStore(action => {
    send(action);
  });

  glob(specs).then(files => {
    store.dispatch(actions.specFiles.setSpecFiles(files));
  });

  const browser = await chromium.launch({
    headless: process.env.HOLLY_FORCE_HEADLESS ? true : false
  }); // Or 'firefox' or 'webkit'.
  // TODO: Work out how to deal with contexts
  const context = await browser.newContext();

  const mochaOptions = makeMochaOptions(config);

  await finishedPromise;

  debug("open mode finished, stopping playwright");

  await browser.close();

  debug("stopping servers");

  wsServer.stop();
  httpServer.stop();

  debug("servers stopped");
};
