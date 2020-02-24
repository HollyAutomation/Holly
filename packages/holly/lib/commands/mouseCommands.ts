import { ElementHandle } from "playwright";
import { Page } from "playwright-core/lib/page";
import {
  assertPageExists,
  assertPageType,
  assertPageOrElementType
} from "../utils/assert";
import { CommandDefinition } from "../types";

const mouseApi = [
  {
    name: "click",
    isPage: true,
    isElement: true
  },
  { name: "dblclick", isPage: true, isElement: true },
  { name: "down", alias: "mousedown", isPage: true, isElement: false },
  { name: "move", alias: "mousemove", isPage: true, isElement: false },
  { name: "tripleclick", isPage: true, isElement: true },
  { name: "up", alias: "mouseup", isPage: true, isElement: false }
];

export const rootCommands: ReadonlyArray<CommandDefinition> = mouseApi.map(
  ({ name, alias }) => {
    const commandName = alias || name;
    return {
      name: commandName,
      async run({ holly }, ...args: ReadonlyArray<any>) {
        const page = holly.__page;
        assertPageExists(page, commandName);
        // @ts-ignore
        await page.mouse[name](...args);
        return page;
      },
      canRetry: false
    };
  }
);

export const chainedCommands: ReadonlyArray<CommandDefinition> = mouseApi.map(
  ({ name, isElement, alias }) => {
    const commandName = alias || name;
    return {
      name: commandName,
      async run(
        _,
        pageOrElement: Page | ElementHandle,
        ...args: ReadonlyArray<any>
      ) {
        if (!isElement) {
          assertPageType(pageOrElement, commandName);
        } else {
          assertPageOrElementType(pageOrElement, commandName);
        }

        const mouse =
          pageOrElement instanceof Page ? pageOrElement.mouse : pageOrElement;

        // @ts-ignore
        await mouse[name](...args);
        return pageOrElement;
      },
      canRetry: false
    };
  }
);
