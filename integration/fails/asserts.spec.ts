import { createTestServer, bodyToHtml, TestServer } from "../testServer";

const { newPage, $, pipe, mousemove } = holly;

describe("Asserts", () => {
  let testServer: TestServer;
  before(() => {
    testServer = createTestServer();
  });
  after(() => {
    testServer.close();
  });

  it("$ fails without newPage", async () => {
    await $(".test");
  });

  it("pipe fails without newPage", () => {
    pipe(() => window.test);
  });

  it("mouse fails without newPage", async () => {
    await mousemove(100, 100);
  });

  it("value fails on a non element", async () => {
    const url = testServer.addResponse(
      bodyToHtml(`<div class="test">Test Element</div>`)
    );
    await newPage(url);

    await $(".test")
      .text()
      .value();
  });

  it("mouse fails on an element", async () => {
    const url = testServer.addResponse(
      bodyToHtml(`<div class="test">Test Element</div>`)
    );
    await newPage(url);
    await $(".test").mousedown();
  });

  it("fails on an element that doesn't exist", async () => {
    const url = testServer.addResponse(
      bodyToHtml(`<div class="test">Test Element</div>`)
    );
    await newPage(url);
    await $(".test-nope").click();
  });
});
