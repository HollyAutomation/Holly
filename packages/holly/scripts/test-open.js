#!/usr/bin/env node

const runCli = require("../build/cli");
const { run } = require("../build");
const path = require("path");

(async () => {
  console.log("starting Holly cli in open mode...");
  runCli();

  // wait for http server to be setup. Not sure how to avoid waits?
  // add hooks with events?
  await new Promise(resolve => setTimeout(resolve, 1000));

  const openConfig = require(path.resolve("integration/open/.hollyrc.js"));

  await run(openConfig);

  // app should exit by itself, but if it doesn't this stops a hang
  setTimeout(() => process.exit(1), 10000);
})();
