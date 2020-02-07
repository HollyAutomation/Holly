import {
  Page as PageType,
  ElementHandle as ElementHandleType
} from "playwright";
import { Page } from "playwright-core/lib/page";
import { ElementHandle } from "playwright-core/lib/dom";

export const assertPageExists = (
  page: PageType | void | null,
  commandName: string
): PageType => {
  if (!page) {
    throw new Error(
      `Go to a page (e.g. holly.newPage) before using ${commandName}`
    );
  }
  return page;
};

export const assertPageType = (page: any, commandName: string): PageType => {
  if (!(page instanceof Page)) {
    throw new Error(`The ${commandName} command can only be run on a page`);
  }
  return page;
};

export const assertElementType = (
  element: any,
  commandName: string,
  afterMsg?: string
): ElementHandleType => {
  if (!(element instanceof ElementHandle)) {
    throw new Error(
      `The ${commandName} command was expecting to be run on a element${afterMsg ||
        ""}`
    );
  }
  return element;
};
