import createHolly from "./holly";
import { BrowserContext } from "playwright";
import Mocha = require("mocha");
import Debug from "debug";
import { Config, Holly } from "./types";

const debug = Debug("holly:runSuite");

export const makeMocha = (
  mochaOptions: Mocha.MochaOptions,
  holly: Holly,
  suiteFile: string
): Mocha => {
  // @ts-ignore
  const mocha = new Mocha(mochaOptions);

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

  return mocha;
};

export default (
  mochaOptions: Mocha.MochaOptions,
  context: BrowserContext,
  config: Config,
  suiteFile: string,
  Collector: ReporterConstructor | void
) => {
  return new Promise(resolve => {
    const holly = createHolly(config);

    const mocha = makeMocha(mochaOptions, holly, suiteFile);

    if (Collector) {
      mocha.reporter(Collector);
    }

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

    mocha.suite.afterEach(async () => {
      await holly.__end();
    });

    mocha.suite.emit(Mocha.Suite.constants.EVENT_ROOT_SUITE_RUN);
  });
};
