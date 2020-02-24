import {
  Page as PageType,
  ElementHandle as ElementHandleType
} from "playwright";
import { Page } from "playwright-core/lib/page";
import { ElementHandle } from "playwright-core/lib/dom";

export function assertPageExists(
  page: PageType | void | null,
  commandName: string
): asserts page is PageType {
  if (!page) {
    throw new Error(
      `Go to a page (e.g. holly.newPage) before using ${commandName}`
    );
  }
}

export function assertPageOrElementType(
  pageOrElement: any,
  commandName: string
): asserts pageOrElement is PageType | ElementHandleType {
  if (pageOrElement instanceof Page || pageOrElement instanceof ElementHandle) {
    return;
  }
  throw new Error(
    `The ${commandName} command can only be run on a page or an element`
  );
}

export function assertElementType(
  element: any,
  commandName: string
): asserts element is ElementHandleType {
  if (!(element instanceof ElementHandle)) {
    throw new Error(
      `The ${commandName} command was expecting to be run on a element`
    );
  }
}

export function assertPageType(
  element: any,
  commandName: string
): asserts element is PageType {
  if (!(element instanceof Page)) {
    throw new Error(
      `The ${commandName} command was expecting to be run on a page`
    );
  }
}
