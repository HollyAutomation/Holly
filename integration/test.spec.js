describe("Integration", () => {
  it("works async", async () => {
    await holly.newPage("http://www.google.com");
    await holly.$("input[type=text]").type("hello");
    await holly
      .$("input[type=text]")
      .value()
      .shouldMatchInlineSnapshot(`'hello'`);
  });

  it("works sync", async () => {
    holly.newPage("http://www.google.com");
    holly.$("input[type=text]").type("hello");
    holly
      .$("input[type=text]")
      .value()
      .shouldMatchInlineSnapshot(`'hello'`);
  });
});
