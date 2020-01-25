describe("Integration", () => {
  it("works", () => {
    sp.visit("http://www.google.com");
    sp.get("INPUT").type("hello");
    sp.get("INPUT")
      .value()
      .shouldEqual("hello");
  });
});
