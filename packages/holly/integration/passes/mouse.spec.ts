import { createTestServer, bodyToHtml, TestServer } from "../testServer";

const { newPage, $, click } = holly;

describe("Mouse", () => {
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
          <button class="testbtn">Test Button</button>
          <div class="testdiv">Test Button</div>
          <script>
            const el = document.getElementsByClassName("testbtn")[0];
            el.onclick = () => {
              document.getElementsByClassName("testdiv")[0].innerHTML = "clicked";
            }
          </script>
          `
        )
      );
      await newPage(url);
    });

    it("clicks a element", async () => {
      await $(".testbtn").click();

      await $(".testdiv")
        .text()
        .shouldEqual("clicked");
    });
  });

  describe("page api", () => {
    beforeEach(async () => {
      const url = testServer.addResponse(
        bodyToHtml(
          `
          <div class="testdiv"></div>
          <script>
            document.body.onclick = () => {
              document.getElementsByClassName("testdiv")[0].innerHTML = "clicked";
            }
          </script>
          `
        )
      );
      await newPage(url);
    });

    it("clicks a page", async () => {
      await click(10, 10);

      await $(".testdiv")
        .text()
        .shouldEqual("clicked");
    });
  });
});
