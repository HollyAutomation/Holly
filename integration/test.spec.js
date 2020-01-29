describe("Integration", () => {
  beforeEach(async ({ newPage }) => {
    await newPage("http://www.google.com");
  });

  it("works async", async ({ $ }) => {
    await $("input[type=text]").type("hello");
    await $("input[type=text]")
      .value()
      .shouldMatchInlineSnapshot(`'hello'`);
  });

  it("works sync", async ({ $ }) => {
    $("input[type=text]").type("hello");
    $("input[type=text]")
      .value()
      .shouldMatchInlineSnapshot(`'hello'`);
  });
});
