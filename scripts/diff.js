const diff = require("diff");

function color(type, str) {
  if (!type) return str;
  return "\u001b[" + (type === "+" ? 31 : 32) + "m" + str + "\u001b[0m";
}

module.exports = (expected, received) =>
  diff.diffChars(expected, received).forEach(part => {
    process.stderr.write(
      color(part.added ? "+" : part.removed ? "-" : "", part.value)
    );
  });
