import createHolly from "./holly";
import { BrowserContext } from "playwright";
import Mocha = require("mocha");
import Debug from "debug";
import { Config } from "./types";

const debug = Debug("holly:runSuite");

export default (
  mochaOptions: Mocha.MochaOptions,
  context: BrowserContext,
  config: Config,
  suiteFile: string,
  Collector: ReporterConstructor
) => {
  return new Promise(resolve => {
    const holly = createHolly(config);

    // @ts-ignore
    const mocha = new Mocha(mochaOptions);
    mocha.reporter(Collector);

    // @ts-ignore
    mocha.suite.holly = holly;

    mocha.addFile(suiteFile);

    mocha.suite.on(
      Mocha.Suite.constants.EVENT_FILE_PRE_REQUIRE,
      (context: any) => {
        // @ts-ignore
        context.getHolly = () => holly;
      }
    );

    mocha.suite.on(
      Mocha.Suite.constants.EVENT_FILE_POST_REQUIRE,
      (context: any) => {
        // @ts-ignore
        context.getHolly = null;
      }
    );

    const runner = mocha.run(async () => {
      if (holly.__page) {
        await holly.__page.close();
      }
      // @ts-ignore
      mocha.unloadFiles();
      resolve();
    });

    runner.on(Mocha.Runner.constants.EVENT_TEST_BEGIN, function(
      test: Mocha.Test
    ) {
      debug("test start");
      holly.__start(context, test);
    });

    mocha.suite.emit(Mocha.Suite.constants.EVENT_ROOT_SUITE_RUN);
  });
};
