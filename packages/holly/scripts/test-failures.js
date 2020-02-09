#!/usr/bin/env node

// insipired by https://github.com/nodejs/node-v0.x-archive/blob/master/lib/util.js#L25
const formatRegExp = /%[sdj%]/g;
function logFormat(args) {
  if (typeof args[0] !== "string") {
    return args.join(" ");
  }

  let i = 1;
  let str = args[0].replace(formatRegExp, function(x) {
    if (x === "%%") return "%";
    if (i >= args.length) return x;
    switch (x) {
      case "%s":
        return String(args[i++]);
      case "%d":
        return Number(args[i++]);
      case "%j":
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return "[Circular]";
        }
      default:
        return x;
    }
  });
  for (; i < args.length; i++) {
    str += " " + args[i];
  }
  return str;
}

const fs = require("fs");
let mochaOutput = "";
const oldLog = console.log;
console.log = (...args) => {
  mochaOutput += logFormat(args) + "\n";
  oldLog(...args);
};
const runCli = require("../build/cli");

(async () => {
  try {
    oldLog("starting Holly cli...");
    await runCli();

    const outputExpected = fs.readFileSync(
      "integration/fails/expected.txt",
      "utf8"
    );
    mochaOutput = mochaOutput
      // use more basic window equivalents - https://github.com/mochajs/mocha/blob/master/lib/reporters/base.js#L88
      .replace(/✓/g, "\u221A")
      .replace(/✖/g, "\u00D7")
      .replace(/․/g, ".")
      // get rid of times
      .replace(/ passing \(.+\)/, " passing")
      // get rid of inconsistent slashes
      .replace(/integration\\fails\\/g, "integration/fails/");

    const pass = outputExpected === mochaOutput;
    if (!pass) {
      oldLog("Failures didn't match:");

      const diff = require("./diff");
      diff(outputExpected, mochaOutput);
      oldLog();
      oldLog("\nreplacing expected...\n");

      process.exitCode = 1;
      fs.writeFileSync("integration/fails/expected.txt", mochaOutput, "utf8");
    } else {
      oldLog("Output matched");

      if (process.exitCode === 0 || process.exitCode == null) {
        oldLog("But exit code was not set, so failing.");
        process.exitCode = 1;
      } else {
        process.exitCode = 0;
      }
    }
  } catch (e) {
    oldLog("Failed with exception", e);
  }
})();
