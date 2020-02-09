import { createTestServer, bodyToHtml, TestServer } from "../testServer";

const { newPage, $ } = holly;

describe("Assertion Retry", () => {
  let testServer: TestServer;
  before(() => {
    testServer = createTestServer();
  });
  after(() => {
    testServer.close();
  });

  describe("retries getting a value", () => {
    beforeEach(async () => {
      const url = testServer.addResponse(
        bodyToHtml(`Input Test Page <br/> <input id="inp" type="text" value="" />
        <script>
          setTimeout(() => {
            document.getElementById('inp').value = 'hello';
          }, 3000);
        </script>`)
      );
      await newPage(url);
    });

    it("works async", async () => {
      await $("#inp")
        .value()
        .shouldEqual("hello");
    });

    it("works sync", () => {
      $("#inp")
        .value()
        .shouldEqual("hello");
    });
  });

  describe("retries when the element is recreated", () => {
    beforeEach(async () => {
      const url = testServer.addResponse(
        bodyToHtml(`Input Test Page <br/> <div id="replace_children"><input id="inp" type="text" value="" /></div>
        <script>
          setTimeout(() => {
            document.getElementById('replace_children').innerHTML = '<input type="text" id="inp" value="hello">';
          }, 3000);
        </script>`)
      );
      await newPage(url);
    });

    it("works async", async () => {
      await $("#inp")
        .value()
        .shouldEqual("hello");
    });

    it("works sync", () => {
      $("#inp")
        .value()
        .shouldEqual("hello");
    });
  });
});
