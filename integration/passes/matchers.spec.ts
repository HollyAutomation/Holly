import { createTestServer, bodyToHtml, TestServer } from "../testServer";

const { newPage, $, any, pipe } = holly;

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
Input Test Page <br/> <input type="text" value="Hello World" /><script>window.num = 1.234;</script>
    `)
    );
    await newPage(url);
  });

  it("command matchers - positive", async () => {
    await pipe(
      // @ts-ignore
      () => window.num
    )
      .shouldBeDefined()
      .and.shouldBeCloseTo(1.23);

    await $("input[type=text]")
      .value()
      .shouldNotEqual("Hello Luke");
    $("input[type=text]")
      .value()
      .shouldMatch(/hello/i);
  });

  it("command matchers - negative", async () => {
    await pipe(
      // @ts-ignore
      () => window.not_defined
    ).shouldNotBeDefined();

    await pipe(
      // @ts-ignore
      () => window.num
    ).shouldNotBeCloseTo(1.23, 3);

    await $("input[type=text]")
      .value()
      .shouldNotEqual("Hello Luke");
    $("input[type=text]")
      .value()
      .shouldMatch(/hello/i);
  });

  it("asymmetric matchers", async () => {
    $("input[type=text]")
      .value()
      .shouldEqual(any(String));
  });
});
