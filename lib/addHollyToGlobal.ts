function registerExtension(ext: string) {
  const old = require.extensions[ext] || require.extensions[".js"];

  require.extensions[ext] = function(m: any, filename) {
    const _compile = m._compile;

    m._compile = function(code: string, fileName: string) {
      return _compile.call(
        this,
        "const holly = typeof getHolly === 'function' && getHolly();" + code,
        fileName
      );
    };

    return old(m, filename);
  };
}

registerExtension(".ts");
registerExtension(".tsx");
registerExtension(".mjs");
registerExtension(".js");
registerExtension(".jsx");
