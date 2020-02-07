const diff = require("diff");

function color(type, str) {
  if (!type) return str;
  return "\u001b[" + (type === "+" ? 31 : 32) + "m" + str + "\u001b[0m";
}

module.exports = (expected, received) =>
  diff.diffChars(expected, received).forEach(part => {
    let value = part.value;
    if (!part.added && !part.removed && part.value.split("\n") > 6) {
      const lines = part.value.split("\n");
      value = [
        lines[0],
        lines[1],
        lines[2],
        "...",
        lines[lines.length - 3],
        lines[lines.length - 2],
        lines[lines.length - 1]
      ].join("\n");
    }
    process.stderr.write(
      color(part.added ? "+" : part.removed ? "-" : "", value)
    );
  });
