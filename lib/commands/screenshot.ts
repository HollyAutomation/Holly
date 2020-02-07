import { Page } from "playwright-core/lib/page";
import { assertPageExists, assertElementType } from "../utils/assert";
import { ElementHandle } from "playwright";
import { Holly } from "../types";
import * as path from "path";
import mkdirp = require("mkdirp");

const DEFAULT_SCREENSHOT_DIR = "screenshots";

async function pageScreenshot(page: Page, name?: string) {
  // TODO: make configurable
  const screenshotDir = DEFAULT_SCREENSHOT_DIR;
  const count = 1;

  const dir = path.join(screenshotDir, "test-suite");
  // @ts-ignore awaiting https://github.com/DefinitelyTyped/DefinitelyTyped/pull/42136/files/0fa160d0bbf00fc5bc0176a0ae29a0c5c6566bb0#diff-f6e2b66f57850da0627f3bf5a678f6c8
  await mkdirp(dir);

  await page.screenshot({
    path: path.join(dir, (name || "test-title" + count) + ".png"),
    type: "png",
    fullPage: true,
    clip: undefined, // allow passing
    omitBackground: false // allow passing
  });
}

async function elementScreenshot(element: ElementHandle, name?: string) {
  // TODO: make configurable
  const screenshotDir = DEFAULT_SCREENSHOT_DIR;
  const count = 1;

  const dir = path.join(screenshotDir, "test-suite");
  // @ts-ignore awaiting https://github.com/DefinitelyTyped/DefinitelyTyped/pull/42136/files/0fa160d0bbf00fc5bc0176a0ae29a0c5c6566bb0#diff-f6e2b66f57850da0627f3bf5a678f6c8
  await mkdirp(dir);

  await element.screenshot({
    path: path.join(dir, (name || "test-title" + count) + ".png"),
    type: "png",
    omitBackground: false // allow passing
  });
}

export const root = {
  name: "screenshot",
  run(holly: Holly, name?: string) {
    const page = assertPageExists(holly.__page, "screenshot");
    return pageScreenshot(page, name);
  },
  canRetry: false
};

export const chained = {
  name: "screenshot",
  run(holly: Holly, value: any, name?: string) {
    if (value instanceof Page) {
      return pageScreenshot(value, name);
    }
    const element = assertElementType(value, "screenshot", " or a page");
    return elementScreenshot(element, name);
  },
  canRetry: false
};
