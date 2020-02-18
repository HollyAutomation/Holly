#!/usr/bin/env node
"use strict";

const path = require("path");
const { spawnSync } = require("child_process");

const rimraf = require("rimraf");
const makeDir = require("make-dir");
const glob = require("glob");

process.chdir(path.join(__dirname, ".."));
rimraf.sync(".nyc_output");
makeDir.sync(".nyc_output");

function mergePackage(nycOutput, mergePart) {
  const cwd = path.dirname(nycOutput);
  const { status, stderr } = spawnSync(
    "nyc",
    [
      "merge",
      path.basename(nycOutput),
      path.join(__dirname, "../.nyc_output", path.basename(cwd) + ".json")
    ],
    {
      encoding: "utf8",
      shell: true,
      cwd
    }
  );

  if (status !== 0) {
    console.error(stderr);
    process.exit(status);
  }
}

mergePackage("packages/holly/.nyc_output", ".nyc_output");
mergePackage("packages/holly-ui/coverage", "coverage/lcov.info");
