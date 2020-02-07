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

  describe("command matchers - positive", async () => {
    it("shouldBeDefined", async () => {
      await pipe(
        // @ts-ignore
        () => window.not_defined
      ).shouldBeDefined();
    });

    it("shouldBeTruthy", async () => {
      await pipe(
        // @ts-ignore
        () => window.not_defined
      ).shouldBeTruthy();
    });

    it("shouldBeCloseTo", async () => {
      await pipe(
        // @ts-ignore
        () => window.num
      ).shouldBeCloseTo(1.23, 3);
    });

    it("shouldBeGreaterThan", async () => {
      await pipe(
        // @ts-ignore
        () => window.num
      ).shouldBeGreaterThan(1.3);
    });

    it("shouldBeGreaterThanOrEqual", async () => {
      await pipe(
        // @ts-ignore
        () => window.num
      ).shouldBeGreaterThanOrEqual(1.4);
    });

    it("shouldBeLessThan", async () => {
      await pipe(
        // @ts-ignore
        () => window.num
      ).shouldBeLessThan(1.1);
    });

    it("shouldBeLessThanOrEqual", async () => {
      await pipe(
        // @ts-ignore
        () => window.num
      ).shouldBeLessThanOrEqual(1.1);
    });

    it("shouldBeFalsy", async () => {
      await pipe(
        // @ts-ignore
        () => window.num
      ).shouldBeFalsy();
    });

    it("shouldBeUndefined", async () => {
      await $("input[type=text]")
        .value()
        .shouldBeUndefined();
    });

    it("shouldBeNull", async () => {
      await pipe(
        // @ts-ignore
        () => window.not_defined
      ).shouldBeNull();
    });

    it("shouldContain string", async () => {
      await $("input[type=text]")
        .value()
        .shouldContain("Luke");
    });

    it("shouldContainEqual", async () => {
      await pipe(
        // @ts-ignore
        () => window.arr
      ).shouldContainEqual({ test: false });
    });

    it("shouldHaveLength array", async () => {
      await pipe(
        // @ts-ignore
        () => window.arr
      ).shouldHaveLength(4);
    });

    it("shouldHaveProperty 1", async () => {
      await pipe(
        // @ts-ignore
        () => window.obj
      ).shouldHaveProperty("a.b.d", "Hello World");
    });

    it("shouldHaveProperty 2", async () => {
      await pipe(
        // @ts-ignore
        () => window.obj
      ).shouldHaveProperty(["a", "b", "d"], "Test");
    });

    it("shouldMatchObject", async () => {
      await pipe(
        // @ts-ignore
        () => window.obj
      ).shouldMatchObject({ a: { b: "test" } });
    });

    it("shouldEqual", async () => {
      await $("input[type=text]")
        .value()
        .shouldEqual("Hello Luke");
    });

    it("shouldContain array", async () => {
      await pipe(
        // @ts-ignore
        () => window.arr
      ).shouldContain("Luke");
    });

    it("shouldMatch", async () => {
      $("input[type=text]")
        .value()
        .shouldMatch(/Luke/i);
    });
  });

  describe("command matchers - negative", async () => {
    it("shouldNotBeDefined", async () => {
      await pipe(
        // @ts-ignore
        () => window.num
      ).shouldNotBeDefined();
    });

    it("shouldNotBeTruthy", async () => {
      await pipe(
        // @ts-ignore
        () => window.num
      ).shouldNotBeTruthy();
    });

    it("shouldNotBeCloseTo", async () => {
      await pipe(
        // @ts-ignore
        () => window.num
      ).shouldNotBeCloseTo(1.23);
    });

    it("shouldNotBeGreaterThan", async () => {
      await pipe(
        // @ts-ignore
        () => window.num
      ).shouldNotBeGreaterThan(1);
    });

    it("shouldNotBeGreaterThanOrEqual", async () => {
      await pipe(
        // @ts-ignore
        () => window.num
      ).shouldNotBeGreaterThanOrEqual(1.234);
    });

    it("shouldNotBeLessThan", async () => {
      await pipe(
        // @ts-ignore
        () => window.num
      ).shouldNotBeLessThan(1.4);
    });

    it("shouldNotBeLessThanOrEqual", async () => {
      await pipe(
        // @ts-ignore
        () => window.num
      ).shouldNotBeLessThanOrEqual(1.234);
    });

    it("shouldNotBeFalsy", async () => {
      await pipe(
        // @ts-ignore
        () => window.not_defined
      ).shouldNotBeFalsy();
    });

    it("shouldNotBeUndefined", async () => {
      await pipe(
        // @ts-ignore
        () => window.not_defined
      ).shouldNotBeUndefined();
    });

    it("shouldNotBeNull", async () => {
      await pipe(
        // @ts-ignore
        () => window.is_null
      ).shouldNotBeNull();
    });

    it("shouldNotContain array", async () => {
      await pipe(
        // @ts-ignore
        () => window.arr
      ).shouldNotContain("World");
    });
    it("shouldNotContainEqual", async () => {
      await pipe(
        // @ts-ignore
        () => window.arr
      ).shouldNotContainEqual({ test: true });
    });

    it("shouldNotHaveLength", async () => {
      await pipe(
        // @ts-ignore
        () => window.arr
      ).shouldNotHaveLength(3);
    });

    it("shouldNotHaveProperty 1", async () => {
      await pipe(
        // @ts-ignore
        () => window.obj
      ).shouldNotHaveProperty("a.b.c", "Hello World");
    });

    it("shouldNotHaveProperty 2", async () => {
      await pipe(
        // @ts-ignore
        () => window.obj
      ).shouldNotHaveProperty(["a", "b", "c"], "Hello World");
    });

    it("shouldNotMatchObject", async () => {
      await pipe(
        // @ts-ignore
        () => window.obj
      ).shouldNotMatchObject({ a: { d: "test" } });
    });

    it("shouldNotEqual", async () => {
      await $("input[type=text]")
        .value()
        .shouldNotEqual("Hello World");
    });

    it("shouldNotContain string", async () => {
      await $("input[type=text]")
        .value()
        .shouldNotContain("World");
    });

    it("shouldNotMatch", async () => {
      $("input[type=text]")
        .value()
        .shouldNotMatch(/hello/i);
    });
  });

  describe("asymmetric matchers", () => {
    it("any string", async () => {
      $("input[type=text]")
        .value()
        .shouldEqual(any(Function));
    });
  });
});
