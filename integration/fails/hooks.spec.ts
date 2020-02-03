import { createTestServer, bodyToHtml, TestServer } from "../testServer";

const { newPage, $, any } = holly;

describe("Matchers", () => {
  let testServer: TestServer;
  before(() => {
    testServer = createTestServer();
  });
  after(() => {
    testServer.close();
  });

  beforeEach(async () => {
    const url = testServer.addResponse(
      bodyToHtml(`
Input Test Page <br/> <input type="text" value="Hello World" />
    `)
    );
    await newPage(url);
  });

  describe("hooks - beforeEach failure", () => {
    beforeEach(async () => {
      await $("input[type=text]")
        .value()
        .shouldEqual("Failure");
    });

    it("should fail", async () => {});
  });

  describe("hooks - afterEach failure", () => {
    afterEach("failing hook", async function() {
      await $("input[type=text]")
        .value()
        .shouldEqual("Failure");
    });

    it("should pass", async () => {});
  });
});
