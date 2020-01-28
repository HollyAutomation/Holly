describe("Integration", () => {
  it("works", () => {
    holly.newPage("http://www.google.com");
    holly.$("input[type=text]").type("hello");
    holly
      .$("input[type=text]")
      .value()
      .shouldMatchInlineSnapshot(`'hello'`);
  });
});
