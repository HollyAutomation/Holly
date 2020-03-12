import { createTestServer, bodyToHtml, TestServer } from "../testServer";
import { HollyChainPageAwaitable, HollyChainElementAwaitable } from "../global";

const { newPage, wrap, $ } = holly;

describe("direct playwright usage", () => {
  let testServer: TestServer;
  before(() => {
    testServer = createTestServer();
  });
  after(() => {
    testServer.close();
  });

  beforeEach(async () => {
    const url = testServer.addResponse(
      bodyToHtml(`<div class="test">hello</div>`)
    );
    await newPage(url);
  });

  it("wraps a page", async () => {
    const playwrightPage =
      // @ts-ignore
      holly.__rootCommands[holly.__rootCommands.length - 1].result.page;

    await wrap<HollyChainPageAwaitable>(playwrightPage)
      .$(".test")
      .text()
      .shouldEqual("hello");
  });

  it("wraps a element", async () => {
    await $(".test");

    const playwrightElement =
      // @ts-ignore
      holly.__rootCommands[holly.__rootCommands.length - 1].result.element;

    await wrap<HollyChainElementAwaitable>(playwrightElement)
      .text()
      .shouldEqual("hello");
  });
});
