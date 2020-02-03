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
};
const runCli = require("../build/cli");

(async () => {
  oldLog("starting Holly cli...");
  await runCli();

  const outputExpected = fs.readFileSync(
    "integration/fails/expected.txt",
    "utf8"
  );
  mochaOutput = mochaOutput
    .replace(/0 passing (.+)/, "0 passing")
    .replace(/integration\\fails\\/g, "integration/fails/");
  const pass = outputExpected === mochaOutput;
  if (!pass) {
    oldLog("Failures didn't match:");
    oldLog(outputExpected);
    oldLog("but got");
    oldLog(mochaOutput);
    oldLog("\nreplacing expected...\n");

    process.exitCode = 1;
    fs.writeFileSync("integration/fails/expected.txt", mochaOutput, "utf8");
  } else {
    oldLog("Output matched");
    process.exitCode = 0;
  }
})();
