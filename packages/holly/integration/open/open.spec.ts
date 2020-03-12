const { newPage, $, byText } = holly;

describe("Open mode", () => {
  beforeEach(async () => {
    await newPage("http://localhost:4000");
  });

  it("shows specs", async () => {
    await $(".tst-spec-list").textArray().shouldMatchInlineSnapshot(`[
                "integration/passes/assertionRetry.spec.ts",
                "integration/passes/clientSidePromises.spec.ts",
                "integration/passes/directPlaywrightUsage.spec.ts",
                "integration/passes/keyboard.spec.ts",
                "integration/passes/matchers.spec.ts",
                "integration/passes/misccommands.spec.ts",
                "integration/passes/mouse.spec.ts",
                "integration/passes/pipe.spec.ts",
                "integration/passes/screenshots.spec.ts",
                "integration/passes/testRetry.spec.ts"
          ]`);

    await byText("mouse.spec.ts").click();

    await $(".tst-test-list").textArray().shouldMatchInlineSnapshot(`[
    [
        "Mouse / element api / clicks a element",
        [
            "F",
            "D"
        ]
    ],
    [
        "Mouse / page api / clicks a page",
        [
            "F",
            "D"
        ]
    ],
    [
        "Mouse / page api / clicks a particular page",
        [
            "F",
            "D"
        ]
    ]
]`);

    await byText("Mouse / element api / clicks a element")
      .parent()
      .byText("F")
      .click();

    $("[data-test-id=test]:nth-child(1)")
      .getAttribute("data-test-state")
      .shouldEqual("focussed");

    $("[data-test-id=test]:nth-child(2)")
      .getAttribute("data-test-state")
      .shouldEqual("normal");

    $("[data-test-id=test]:nth-child(3)")
      .getAttribute("data-test-state")
      .shouldEqual("normal");

    await byText("Start").click();

    await byText("Mouse / element api / clicks a element")
      .parent()
      .$(".tst-command-list")
      .textArray().shouldMatchInlineSnapshot(`[
    "click",
    "text",
    "shouldEqual"
]`);

    // For now - we need to wait for the test to complete to stop these tests failing
    await byText("Mouse / page api / clicks a particular page")
      .parent()
      .$(".tst-command-list")
      .textArray().shouldMatchInlineSnapshot(`[
    "click",
    "text",
    "shouldEqual"
]`);
  });
});
