import { createTestServer, bodyToHtml, TestServer } from "./testServer";

describe("Matchers", () => {
  let testServer: TestServer;
  before(() => {
    testServer = createTestServer();
  });
  after(() => {
    testServer.close();
  });

  beforeEach(async ({ newPage }) => {
    const url = testServer.addResponse(
      bodyToHtml(`
Input Test Page <br/> <input type="text" value="Hello World" />
    `)
    );
    await newPage(url);
  });

  describe("command matchers", () => {
    it("should not equal", async ({ $ }) => {
      await $("input[type=text]")
        .value()
        .shouldNotEqual("Hello Luke");
    });

    it("should match", async ({ $, any }) => {
      $("input[type=text]")
        .value()
        .shouldMatch(/hello/i);
    });
  });

  describe("asymmetric matchers", () => {
    it("any string", async ({ $, any }) => {
      $("input[type=text]")
        .value()
        .shouldEqual(any(String));
    });
  });
});
