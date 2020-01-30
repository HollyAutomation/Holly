const Koa = require("koa");

let port = 3000;

exports.TestServer = () => {
  const app = new Koa();
  const thisPort = port++;

  let responses = {};
  let responseIndex = 0;

  app.use(async function(ctx) {
    const thisResponseIndex = ctx.path.replace(/\//g, "");
    const thisResponse = responses[thisResponseIndex];
    ctx.body = thisResponse;
    delete responses[thisResponseIndex];
  });

  const server = app.listen(thisPort);

  return {
    addResponse(response) {
      const thisResponse = responseIndex++;
      responses[thisResponse] = response;
      return `http://localhost:${thisPort}/${thisResponse}`;
    },
    close() {
      server.close();
    }
  };
};

exports.bodyToHtml = body => `<html><head></head><body>${body}</body></html>`;
