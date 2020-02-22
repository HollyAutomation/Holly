const path = require("path");

const hollyUIPath = path.dirname(require.resolve("holly-ui"));

module.exports = {
  specs: "integration/open/**/*.spec.ts",
  reporters: ["spec"],
  coverage: true,
  sourceRoot: path.join(hollyUIPath, "src"),
  servedBasePath: path.join(hollyUIPath, "build")
};
