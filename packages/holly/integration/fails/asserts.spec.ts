import { createTestServer, bodyToHtml, TestServer } from "../testServer";

const {
  newPage,
  $,
  pipe,
  mousemove,
  byText,
  wrap,
  evaluate,
  setViewportSize
} = holly;

describe("Asserts", () => {
  describe("root commands w/o newPage", () => {
    it("$ fails without newPage", async () => {
      await $(".test");
    });

    it("$ fails without newPage - sync", () => {
      $(".test");
    });

    it("pipe fails without newPage", () => {
      pipe(() => window.test);
    });

    it("mouse fails without newPage", async () => {
      await mousemove(100, 100);
    });
  });

  describe("page or element", () => {
    it("fails calling $ on a value", () => {
      // @ts-ignore types protect this too :)
      wrap({}).$(".test");
    });
  });

  describe("With server", () => {
    let testServer: TestServer;
    before(() => {
      testServer = createTestServer();
    });
    after(() => {
      testServer.close();
    });

    it("value fails on a non element", async () => {
      const url = testServer.addResponse(
        bodyToHtml(`<div class="test">Test Element</div>`)
      );
      await newPage(url);

      await $(".test")
        .text()
        // @ts-ignore types protect this too :)
        .value();
    });

    it("mouse fails on an element", async () => {
      const url = testServer.addResponse(
        bodyToHtml(`<div class="test">Test Element</div>`)
      );
      await newPage(url);
      await $(".test")
        // @ts-ignore types protect this too :)
        .mousedown();
    });

    it("fails on an element that doesn't exist", async () => {
      const url = testServer.addResponse(
        bodyToHtml(`<div class="test">Test Element</div>`)
      );
      await newPage(url);
      await $(".test-nope").click();
    });

    it("fails on an element that doesn't exist - combined description", async () => {
      const url = testServer.addResponse(
        bodyToHtml(`<div class="test">Test Element</div>`)
      );
      await newPage(url);
      await byText("Test")
        .$(".test-nope")
        .click();
    });
  });

  describe("commands with special arguments", () => {
    it("fails on root $ without a selector - null", () => {
      // @ts-ignore types protect this too :)
      $(null);
    });

    it("fails on root $ without a selector - obj", () => {
      // @ts-ignore types protect this too :)
      $({});
    });

    it("fails on chained $ without a selector - fn", () => {
      // @ts-ignore types protect this too :)
      wrap(null).$(() => {});
    });

    it("fails on root byText without text", () => {
      // @ts-ignore types protect this too :)
      byText(null);
    });

    it("fails on root byText without text", () => {
      // @ts-ignore types protect this too :)
      wrap(null).byText({});
    });

    it("fails on root pipe without fn", () => {
      // @ts-ignore types protect this too :)
      pipe(null);
    });

    it("fails on chained pipe without fn", () => {
      // @ts-ignore types protect this too :)
      wrap(null).pipe({});
    });

    it("fails on root evaluate without fn", () => {
      // @ts-ignore types protect this too :)
      evaluate(null);
    });

    it("fails on chained evaluate without fn", () => {
      // @ts-ignore types protect this too :)
      wrap(null).evaluate({});
    });

    it("newPage without url", () => {
      // @ts-ignore types protect this too :)
      newPage({});
    });

    it("newPage without viewport", () => {
      // @ts-ignore types protect this too :)
      newPage("test", true);
    });

    it("setViewportSize without viewport", () => {
      // @ts-ignore types protect this too :)
      setViewportSize(null);
    });

    it("getAttribute without attribute", () => {
      // @ts-ignore types protect this too :)
      wrap(null).getAttribute();
    });
  });
});
