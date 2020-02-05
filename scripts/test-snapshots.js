#!/usr/bin/env node

const globOriginal = require("glob");
const fs = require("fs").promises;
const util = require("util");
const runCli = require("../build/cli");

const glob = util.promisify(globOriginal);

const makeExpected = file => file.replace(/\.ts$/, ".expected");

(async () => {
  console.log("reading files...");
  const files = await glob("integration/snapshots/**/*.spec.ts");
  const originalFileContents = await Promise.all(
    files.map(filename => fs.readFile(filename, "utf8"))
  );
  const expectedFileContents = await Promise.all(
    files.map(filename => fs.readFile(makeExpected(filename), "utf8"))
  );

  try {
    console.log("starting Holly cli to auto update snapshots...");
    await runCli();

    if (process.exitCode != null && process.exitCode > 0) {
      console.error("Run failed");
    } else {
      const updatedFileContents = await Promise.all(
        files.map(file => fs.readFile(file, "utf8"))
      );

      const failedFilenames = [];
      files.forEach((filename, index) => {
        if (updatedFileContents[index] !== expectedFileContents[index]) {
          failedFilenames.push({ filename, index });
        }
      });

      if (failedFilenames.length > 0) {
        console.log("different between expected and received");
        process.exitCode = 1;
        const diff = require("./diff");
        failedFilenames.forEach(({ filename, index }) => {
          console.log(filename, "diff:");
          diff(updatedFileContents[index], expectedFileContents[index]);
          console.log;
        });
        await Promise.all(
          failedFilenames.map(({ filename, index }) =>
            fs.writeFile(
              makeExpected(filename),
              updatedFileContents[index],
              "utf8"
            )
          )
        );
      } else {
        console.log(
          "starting Holly cli to check the updated snapshots pass..."
        );
        await runCli();
        if (process.exitCode != null && process.exitCode > 0) {
          console.error("Run failed");
        }
      }
    }
  } catch (e) {
    console.error("exception occurred:");
    console.error(e);
    process.exitCode = 1;
  }

  console.log("reverting files..");
  await Promise.all(
    files.map((filename, index) =>
      fs.writeFile(filename, originalFileContents[index], "utf8")
    )
  );
})();
