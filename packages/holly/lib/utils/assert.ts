import {
  Page as PageType,
  ElementHandle as ElementHandleType
} from "playwright";
import { CommandResult } from "../types";

export function assertRootPageExists(
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
  commandResult: CommandResult,
  commandName: string
) {
  if (
    commandResult.valueType === "page" ||
    commandResult.valueType === "element"
  ) {
    return;
  }
  throw new Error(
    `The ${commandName} command can only be run on a page or an element`
  );
}

export function assertValueType(
  commandResult: CommandResult,
  commandName: string
) {
  if (commandResult.valueType === "value") {
    return;
  }
  throw new Error(
    `The ${commandName} command can only be run on a value, not a page or element - try converting it to html or text first`
  );
}

export function assertElementType(
  commandResult: CommandResult,
  commandName: string
) {
  if (commandResult.valueType === "element") {
    return;
  }
  throw new Error(`The ${commandName} command can only be run on a element`);
}

export function assertElementSet(
  element: ElementHandleType | null | void,
  commandResult: CommandResult,
  commandName: string
): asserts element is ElementHandleType {
  if (!element) {
    throw new Error(
      `The ${commandName} command could not find element '${commandResult.description ||
        ""}'`
    );
  }
}

export function assertPageSet(
  page: PageType | null | void,
  commandResult: CommandResult,
  commandName: string
): asserts page is PageType {
  if (!page) {
    throw new Error(
      `The ${commandName} command did not get a page from its parent`
    );
  }
}

export function assertPageType(
  commandResult: CommandResult,
  commandName: string
) {
  if (commandResult.valueType !== "page") {
    throw new Error(
      `The ${commandName} command was expecting to be run on a page`
    );
  }
}
