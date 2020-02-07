import { createTestServer, bodyToHtml, TestServer } from "../testServer";
import looksSame = require("looks-same");

const { newPage, $, screenshot, wrap } = holly;

describe("screenshot command", () => {
  let testServer: TestServer;
  before(() => {
    testServer = createTestServer();
  });
  after(() => {
    testServer.close();
  });

  beforeEach(async () => {
    const url = testServer.addResponse(
      bodyToHtml(
        `
          <div class="testdiv1" style="background-color: #FF0000; width: 100px; height: 50px;"></div>
          <div class="testdiv2" style="background-color: #00FF00; width: 100px; height: 50px;"></div>
        `
      )
    );
    await newPage(url, { width: 100, height: 100 }).screenshot();
  });

  it("takes screenshots of an element and a page", async () => {
    const pageComparisonEqual1 = await new Promise<boolean>((resolve, reject) =>
      looksSame(
        "screenshots/screenshot command/takes screenshots of an element and a page1.png",
        "integration/passes/expected-screenshots/page.png",
        { strict: true },
        (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result.equal);
        }
      )
    );

    wrap(pageComparisonEqual1).shouldEqual(true);

    await $(".testdiv1").screenshot("testdiv1");

    const divComparisonEqual = await new Promise<boolean>((resolve, reject) =>
      looksSame(
        "screenshots/screenshot command/testdiv1.png",
        "integration/passes/expected-screenshots/testdiv1.png",
        { strict: true },
        (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result.equal);
        }
      )
    );

    wrap(divComparisonEqual).shouldEqual(true);

    await screenshot();

    const pageComparisonEqual2 = await new Promise<boolean>((resolve, reject) =>
      looksSame(
        "screenshots/screenshot command/takes screenshots of an element and a page2.png",
        "integration/passes/expected-screenshots/page.png",
        { strict: true },
        (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result.equal);
        }
      )
    );

    wrap(pageComparisonEqual2).shouldEqual(true);
  });
});
