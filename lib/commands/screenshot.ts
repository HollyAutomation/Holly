import { Page } from "playwright-core/lib/page";
import { assertPageExists, assertElementType } from "../utils/assert";
import { ElementHandle } from "playwright";
import { Holly } from "../types";

function pageScreenshot(page: Page, name?: string) {}

function elementScreenshot(element: ElementHandle, name?: string) {}

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
