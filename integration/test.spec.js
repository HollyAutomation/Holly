describe("Integration", () => {
  it("works", () => {
    sp.newPage("http://www.google.com");
    sp.$("input[type=text]").type("hello");
    sp.$("input[type=text]")
      .value()
      .shouldMatchInlineSnapshot(`'hello'`);
  });
});
