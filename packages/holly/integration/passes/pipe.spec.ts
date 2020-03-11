import { HollyChainValueAwaitable } from "../global";

const { wrap } = holly;

describe("pipe", () => {
  it("pipes a value", async () => {
    await wrap<HollyChainValueAwaitable>("h")
      .pipe((s: string) => s + "ello")
      .shouldEqual("hello");
  });
});
