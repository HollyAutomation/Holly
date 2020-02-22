const { newPage, $, byText } = holly;

describe("Open mode", () => {
  beforeEach(async () => {
    await newPage("http://localhost:4000");
  });

  it("shows specs", async () => {
    await $(".tst-spec-list").textArray().shouldMatchInlineSnapshot(`[
                "integration/passes/assertionRetry.spec.ts",
                "integration/passes/clientSidePromises.spec.ts",
                "integration/passes/keyboard.spec.ts",
                "integration/passes/matchers.spec.ts",
                "integration/passes/misccommands.spec.ts",
                "integration/passes/mouse.spec.ts",
                "integration/passes/screenshots.spec.ts",
                "integration/passes/testRetry.spec.ts"
          ]`);

    await byText("mouse.spec.ts").click();
  });
});
