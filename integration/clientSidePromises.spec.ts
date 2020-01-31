import { createTestServer, bodyToHtml, TestServer } from "./testServer";

describe("Client Side Promises", () => {
  let testServer: TestServer;
  before(() => {
    testServer = createTestServer();
  });
  after(() => {
    testServer.close();
  });

  it("waits for a promise", async ({ newPage, pipe }) => {
    const url = testServer.addResponse(
      bodyToHtml(
        `Input Test Page <br/>
        <script>
          window.newPromise = new Promise((resolve) => {
            setTimeout(() => {
              resolve('hello');
            }, 1000);
          });
        </script>`
      )
    );
    await newPage(url);

    await pipe(
      // @ts-ignore
      () => window.newPromise
    ).shouldEqual("hello");
  });

  it("waits for a promise without retry", async ({ newPage, evaluate }) => {
    const url = testServer.addResponse(
      bodyToHtml(
        `Input Test Page <br/>
        <script>
          window.newPromise = new Promise((resolve) => {
            setTimeout(() => {
              resolve('hello');
            }, 1000);
          });
        </script>`
      )
    );
    await newPage(url);

    await evaluate(
      // @ts-ignore
      () => window.newPromise
    ).shouldEqual("hello");
  });
});
