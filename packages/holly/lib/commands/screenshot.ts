import { Page } from "playwright-core/lib/page";
import { assertPageExists, assertElementType } from "../utils/assert";
import { ElementHandle } from "playwright";
import { CommandDefinition, Holly } from "../types";
import * as path from "path";
import mkdirp = require("mkdirp");

const DEFAULT_SCREENSHOT_DIR = "screenshots";

async function makePath(holly: Holly, test: Mocha.Test, name?: string) {
  // TODO: make configurable
  const screenshotDir = DEFAULT_SCREENSHOT_DIR;
  if (!holly.__currentTestState.screenshotCount) {
    holly.__currentTestState.screenshotCount = 1;
  }
  const dir = path.join(screenshotDir, test.parent?.fullTitle() || "");
  // @ts-ignore awaiting https://github.com/DefinitelyTyped/DefinitelyTyped/pull/42136/files/0fa160d0bbf00fc5bc0176a0ae29a0c5c6566bb0#diff-f6e2b66f57850da0627f3bf5a678f6c8
  await mkdirp(dir);

  const filename =
    (name || test.title + holly.__currentTestState.screenshotCount++) + ".png";

  return {
    dir,
    filename
  };
}

async function pageScreenshot(
  holly: Holly,
  test: Mocha.Test,
  page: Page,
  name?: string
) {
  const { dir, filename } = await makePath(holly, test, name);

  await page.screenshot({
    path: path.join(dir, filename),
    type: "png",
    fullPage: true,
    clip: undefined, // allow passing
    omitBackground: false // allow passing
  });
}

async function elementScreenshot(
  holly: Holly,
  test: Mocha.Test,
  element: ElementHandle,
  name?: string
) {
  const { dir, filename } = await makePath(holly, test, name);

  await element.screenshot({
    path: path.join(dir, filename),
    type: "png",
    omitBackground: false // allow passing
  });
}

export const root = {
  name: "screenshot",
  run({ holly, test }, name?: string) {
    const page = assertPageExists(holly.__page, "screenshot");
    return pageScreenshot(holly, test, page, name);
  },
  canRetry: false
} as CommandDefinition;

export const chained = {
  name: "screenshot",
  run({ holly, test }, value: any, name?: string) {
    if (value instanceof Page) {
      return pageScreenshot(holly, test, value, name);
    }
    const element = assertElementType(value, "screenshot", " or a page");
    return elementScreenshot(holly, test, element, name);
  },
  canRetry: false
} as CommandDefinition;
