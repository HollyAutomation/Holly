// TODO this needs to move into the caller | be configured
const tsNode = require("ts-node");

tsNode.register({
  project: "integration/tsconfig.json",
  transpileOnly: true
});

module.exports = {
  specs: "integration/**/*.spec.ts"
};
