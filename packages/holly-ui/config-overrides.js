module.exports = function override(config, env) {
  // switch off minification as it makes code coverage unreliable
  config.module.rules[2].oneOf.forEach(section => {
    if (
      section.test &&
      ".ts".match(section.test) &&
      section.options &&
      section.options.compact
    ) {
      section.options.compact = false;
    }
  });
  config.optimization.minimize = false;
  return config;
};
