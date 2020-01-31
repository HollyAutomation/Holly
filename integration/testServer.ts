import Koa = require("koa");

let port = 3000;

export type TestServer = {
  addResponse: (response: string) => string;
  close: () => void;
};

export const createTestServer = () => {
  const app = new Koa();
  const thisPort = port++;

  let responses: { [key: string]: string } = {};
  let responseIndex = 0;

  app.use(async function(ctx) {
    const thisResponseIndex = ctx.path.replace(/\//g, "");
    const thisResponse = responses[thisResponseIndex];
    ctx.body = thisResponse;
    delete responses[thisResponseIndex];
  });

  const server = app.listen(thisPort);

  return {
    addResponse(response: string) {
      const thisResponse = responseIndex++;
      responses[thisResponse] = response;
      return `http://localhost:${thisPort}/${thisResponse}`;
    },
    close() {
      server.close();
    }
  };
};

export const bodyToHtml = (body: string) =>
  `<html><head></head><body>${body}</body></html>`;
