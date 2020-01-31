import { createTestServer, bodyToHtml, TestServer } from "./testServer";

describe("Test Retry", () => {
  let testServer: TestServer;
  before(() => {
    testServer = createTestServer();
  });
  after(() => {
    testServer.close();
  });

  describe("retries a failure in the test body", function() {
    this.retries(2);

    let testIndex = 0;

    beforeEach(async ({ newPage }) => {
      const url = testServer.addResponse(
        bodyToHtml(
          `Input Test Page <br/> <input id="inp" type="text" value="${testIndex++}" />`
        )
      );
      await newPage(url);
    });

    it("works async", async ({ $ }) => {
      await $("#inp")
        .value()
        .shouldEqual("1");
    });

    it("works sync", ({ $ }) => {
      $("#inp")
        .value()
        .shouldEqual("3");
    });
  });
});
