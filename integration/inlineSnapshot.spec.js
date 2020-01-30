const { TestServer, bodyToHtml } = require("./testServer");

describe("Inline Snapshot", () => {
  let testServer;
  before(() => {
    testServer = TestServer();
  });
  after(() => {
    testServer.close();
    testServer = null;
  });

  beforeEach(async ({ newPage }) => {
    const url = testServer.addResponse(
      bodyToHtml(`Input Test Page <br/> <input type="text" value="" />`)
    );
    await newPage(url);
  });

  it("works async", async ({ $ }) => {
    await $("input[type=text]").type("hello");
    await $("input[type=text]")
      .value()
      .shouldMatchInlineSnapshot(`'hello'`);
  });

  it("works sync", ({ $ }) => {
    $("input[type=text]").type("hello");
    $("input[type=text]")
      .value()
      .shouldMatchInlineSnapshot(`'hello'`);
  });
});
