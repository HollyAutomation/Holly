describe("Integration", () => {
  beforeEach(async ({ newPage }) => {
    await newPage("http://www.google.com");
  });

  it("works async", async ({ $ }) => {
    await $("input[type=text]").type("hello");
    await $("input[type=text]")
      .value()
      .shouldNotEqual("test not equal");
  });

  it("works sync", async ({ $, any }) => {
    $("input[type=text]").type("hello");
    $("input[type=text]")
      .value()
      .shouldMatch(/hello/);
    $("input[type=text]")
      .value()
      .shouldEqual(any(String));
  });
});
