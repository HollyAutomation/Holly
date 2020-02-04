import { expect } from "chai";
import parseTime from "./parseTime";

describe("parseTime", () => {
  it("supports a string int", () => {
    expect(parseTime("12", 1)).to.equal(12);
  });

  it("supports a number", () => {
    expect(parseTime(12, 1)).to.equal(12);
  });

  it("supports a string with unit", () => {
    expect(parseTime("2s", 1)).to.equal(2000);
  });

  it("defaults", () => {
    expect(parseTime(undefined, 1)).to.equal(1);
    expect(parseTime(null, 1)).to.equal(1);
  });

  it("throws on bad arguments", () => {
    // @ts-ignore
    expect(() => parseTime({}, 1)).to.throw();
    expect(() => parseTime("1z", 2)).to.throw();
  });
});
