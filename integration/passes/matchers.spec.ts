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
Input Test Page <br/> <input type="text" value="Hello World" />
<script>
  window.num = 1.234;
  window.is_null = null;
  window.arr = ['Hello', 'World', { test: true }];
  window.obj = { a: { b: { c: 'Hello World' }, d: 'test' }  }
</script>
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
      .and.shouldBeTruthy()
      .and.shouldBeCloseTo(1.23)
      .and.shouldBeGreaterThan(1)
      .and.shouldBeGreaterThanOrEqual(1.234)
      .and.shouldBeLessThanOrEqual(1.234)
      .and.shouldBeLessThan(1.4);

    await pipe(
      // @ts-ignore
      () => window.not_defined
    )
      .shouldBeFalsy()
      .and.shouldBeUndefined();

    await pipe(
      // @ts-ignore
      () => window.is_null
    ).shouldBeNull();

    await pipe(
      // @ts-ignore
      () => window.arr
    )
      .shouldContain("World")
      .and.shouldContainEqual({ test: true })
      .and.shouldHaveLength(3);

    await pipe(
      // @ts-ignore
      () => window.obj
    )
      .shouldHaveProperty("a.b.c", "Hello World")
      .and.shouldHaveProperty(["a", "b", "c"], "Hello World")
      .and.shouldMatchObject({ a: { d: "test" } });

    await $("input[type=text]")
      .value()
      .shouldEqual("Hello World")
      .and.shouldContain("World");

    $("input[type=text]")
      .value()
      .shouldMatch(/hello/i);
  });

  it("command matchers - negative", async () => {
    await pipe(
      // @ts-ignore
      () => window.not_defined
    )
      .shouldNotBeDefined()
      .and.shouldNotBeNull()
      .and.shouldNotBeTruthy();

    await pipe(
      // @ts-ignore
      () => window.num
    )
      .shouldNotBeCloseTo(1.23, 3)
      .and.shouldNotBeFalsy()
      .and.shouldNotBeGreaterThan(1.3)
      .and.shouldNotBeGreaterThanOrEqual(1.4)
      .and.shouldNotBeLessThanOrEqual(1.1)
      .and.shouldNotBeLessThan(1.1);

    await $("input[type=text]")
      .value()
      .shouldNotEqual("Hello Luke")
      .and.shouldNotContain("Luke")
      .and.shouldNotBeUndefined();

    await pipe(
      // @ts-ignore
      () => window.arr
    )
      .shouldNotContain("Luke")
      .and.shouldNotContainEqual({ test: false })
      .and.shouldNotHaveLength(4);

    await pipe(
      // @ts-ignore
      () => window.obj
    )
      .shouldNotHaveProperty("a.b.d", "Hello World")
      .and.shouldNotHaveProperty(["a", "b", "d"], "Test")
      .and.shouldNotMatchObject({ a: { b: "test" } });

    $("input[type=text]")
      .value()
      .shouldNotMatch(/Luke/i);
  });

  it("asymmetric matchers", async () => {
    $("input[type=text]")
      .value()
      .shouldEqual(any(String));
  });
});
