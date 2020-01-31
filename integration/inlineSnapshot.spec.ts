import { createTestServer, bodyToHtml, TestServer } from "./testServer";

const { newPage, $ } = holly;

describe("Inline Snapshot", () => {
  let testServer: TestServer;
  before(() => {
    testServer = createTestServer();
  });
  after(() => {
    testServer.close();
  });

  beforeEach(async () => {
    const url = testServer.addResponse(
      bodyToHtml(`Input Test Page <br/> <input type="text" value="" />`)
    );
    await newPage(url);
  });

  it("works async", async () => {
    await $("input[type=text]").type("hello");
    await $("input[type=text]")
      .value()
      .shouldMatchInlineSnapshot(`'hello'`);
  });

  it("works sync", () => {
    $("input[type=text]").type("hello");
    $("input[type=text]")
      .value()
      .shouldMatchInlineSnapshot(`'hello'`);
  });
});
