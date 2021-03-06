import { createTestServer, bodyToHtml, TestServer } from "../testServer";

const { newPage, $, keypress } = holly;

describe("Keyboard", () => {
  let testServer: TestServer;
  before(() => {
    testServer = createTestServer();
  });
  after(() => {
    testServer.close();
  });

  describe("element api", () => {
    beforeEach(async () => {
      const url = testServer.addResponse(
        bodyToHtml(
          `
          <input class="testinp" value=""></input>
          <div class="testdiv"></div>
          <script>
            setInterval(() => {
              document.getElementsByClassName("testdiv")[0].innerHTML = document.getElementsByClassName("testinp")[0].value;
            }, 20);
          </script>
          `
        )
      );
      await newPage(url);
    });

    it("types in an input", async () => {
      await $(".testinp").type("Hello World");

      await $(".testdiv")
        .text()
        .shouldEqual("Hello World");
    });
  });

  describe("page api", () => {
    beforeEach(async () => {
      const url = testServer.addResponse(
        bodyToHtml(
          `
          <div class="testdiv"></div>
          <script>
            document.body.onkeydown = (e) => {
              document.getElementsByClassName("testdiv")[0].innerHTML += e.key;
            }
          </script>
          `
        )
      );
      await newPage(url).keypress("a");
    });

    it("types in a page", async () => {
      await keypress("b");
      await keypress("c");

      await $(".testdiv")
        .text()
        .shouldEqual("abc");
    });
  });
});
