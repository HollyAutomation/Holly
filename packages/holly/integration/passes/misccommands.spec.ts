import { createTestServer, bodyToHtml, TestServer } from "../testServer";

const { newPage, $, setViewportSize } = holly;

describe("Misc commands", () => {
  let testServer: TestServer;
  before(() => {
    testServer = createTestServer();
  });
  after(() => {
    testServer.close();
  });

  describe("set viewport", () => {
    beforeEach(async () => {
      const url = testServer.addResponse(
        bodyToHtml(
          `
          <div class="testdiv"></div>
          <script>
          document.getElementsByClassName("testdiv")[0].innerHTML = window.innerWidth + 'x' + window.innerHeight;
            window.onresize = () => {
              document.getElementsByClassName("testdiv")[0].innerHTML = window.innerWidth + 'x' + window.innerHeight;
            }
          </script>
          `
        )
      );
      await newPage(url, { width: 10, height: 11 });
    });

    it("sets the viewport", async () => {
      await $(".testdiv")
        .text()
        .shouldEqual("10x11");

      await setViewportSize({ width: 15, height: 16 });

      await $(".testdiv")
        .text()
        .shouldEqual("15x16");
    });
  });

  describe("focus", () => {
    beforeEach(async () => {
      const url = testServer.addResponse(
        bodyToHtml(
          `
          <div class="testdiv" tabindex="0"></div>
          <script>
          document.getElementsByClassName("testdiv")[0].onfocus = () => {
              document.getElementsByClassName("testdiv")[0].innerHTML = 'focussed';
            }
          </script>
          `
        )
      );
      await newPage(url);
    });

    it("focuses", async () => {
      await $(".testdiv")
        .text()
        .shouldEqual("");

      await $(".testdiv").focus();

      await $(".testdiv")
        .text()
        .shouldEqual("focussed");
    });
  });

  describe("hover", () => {
    beforeEach(async () => {
      const url = testServer.addResponse(
        bodyToHtml(
          `
          <div class="testdiv" style="width: 100px; height: 100px;"></div>
          <script>
            document.getElementsByClassName("testdiv")[0].onmouseover = () => {
              document.getElementsByClassName("testdiv")[0].innerHTML = 'mouseover';
            }
            document.getElementsByClassName("testdiv")[0].onmouseout = () => {
              document.getElementsByClassName("testdiv")[0].innerHTML = 'mouseout';
            }
          </script>
          `
        )
      );
      await newPage(url);
    });

    it("hovers", async () => {
      await $(".testdiv")
        .text()
        .shouldEqual("");

      await $(".testdiv").hover();

      await $(".testdiv")
        .text()
        .shouldEqual("mouseover");
    });
  });

  describe("scrollIntoViewIfNeeded", () => {
    beforeEach(async () => {
      const url = testServer.addResponse(
        bodyToHtml(
          `
          <div class="testdiv1" style="width: 100px; height: 3000px;"></div>
          <div class="testdiv2" style="width: 100px; height: 100px;"></div>
          <script>
            window.onscroll = () => {
              document.getElementsByClassName("testdiv2")[0].innerHTML = 'found me';
            }
          </script>
          `
        )
      );
      await newPage(url);
    });

    it("scrolls into view if needed", async () => {
      await $(".testdiv2")
        .text()
        .shouldEqual("");

      await $(".testdiv2").scrollIntoViewIfNeeded();

      await $(".testdiv2")
        .text()
        .shouldEqual("found me");
    });
  });
});
