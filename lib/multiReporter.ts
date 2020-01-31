import Mocha = require("mocha");
import { EventEmitter } from "events";

export function createMultiReporter() {
  const reporters: Array<{
    done?: (failures: number, callback: () => void) => void;
  }> = [];

  const fakeRunner = new EventEmitter();
  const allStats: Mocha.Stats = {
    suites: 0,
    tests: 0,
    passes: 0,
    pending: 0,
    failures: 0
  };
  // @ts-ignore
  fakeRunner.stats = allStats;

  class Collector {
    events: Array<{
      name: string;
      args: ReadonlyArray<any>;
    }> = [];

    stats?: Mocha.Stats;

    constructor(runner: Mocha.Runner) {
      this.stats = runner.stats;
      Object.keys(Mocha.Runner.constants).forEach(eventConstantKey => {
        if (
          eventConstantKey === "EVENT_RUN_BEGIN" ||
          eventConstantKey === "EVENT_RUN_END"
        ) {
          return;
        }

        runner.on(
          // @ts-ignore
          Mocha.Runner.constants[eventConstantKey],
          (...args: ReadonlyArray<any>) => {
            this.events.push({
              // @ts-ignore
              name: Mocha.Runner.constants[eventConstantKey],
              args
            });
          }
        );
      });
    }

    done(failures: number, fn: () => void) {
      this.events.forEach(event => {
        fakeRunner.emit(event.name, ...event.args);
      });

      if (this.stats) {
        allStats.suites += this.stats.suites;
        allStats.tests += this.stats.tests;
        allStats.passes += this.stats.passes;
        allStats.pending += this.stats.pending;
        allStats.failures += this.stats.failures;
      } else {
        throw new Error("no stats found - unexpected");
      }

      fn();
    }
  }

  const start = () => {
    allStats.start = new Date();
    fakeRunner.emit(Mocha.Runner.constants.EVENT_RUN_BEGIN);
  };

  const finished = async () => {
    allStats.end = new Date();
    allStats.duration = Number(allStats.end) - Number(allStats.start);
    fakeRunner.emit(Mocha.Runner.constants.EVENT_RUN_END);
    await Promise.all(
      reporters.map(reporter => {
        return new Promise(resolve => {
          if (reporter.done) {
            reporter.done(allStats.failures, resolve);
          } else {
            resolve();
          }
        });
      })
    );
  };

  function addReporter(
    reporter: string | ReporterConstructor,
    reporterOptions: any,
    mochaOptions: any
  ) {
    const fakeMocha = {
      _reporter: (null as unknown) as ReporterConstructor,
      options: {}
    };
    Mocha.prototype.reporter.call(fakeMocha, reporter, {
      ...mochaOptions,
      reporterOptions,
      reporterOption: reporterOptions
    });

    // @ts-ignore
    const reporterInst = new fakeMocha._reporter(fakeRunner, reporterOptions);
    reporters.push(reporterInst);
  }

  return {
    Collector: (Collector as unknown) as ReporterConstructor,
    addReporter,
    start,
    finished
  };
}
