import { ElementHandle } from "playwright";
import { Page } from "playwright-core/lib/page";
import {
  assertPageOrElementType,
  assertPageExists,
  assertElementType
} from "../utils/assert";
import { CommandDefinition } from "../types";

const keyboardApi = [
  {
    name: "type",
    isPage: true,
    isElement: true
  },
  { name: "up", alias: "keyup", isPage: true, isElement: false },
  { name: "down", alias: "keydown", isPage: true, isElement: false },
  { name: "press", alias: "keypress", isPage: true, isElement: true },
  { name: "sendCharacters", isPage: true, isElement: false }
];

export const rootCommands: ReadonlyArray<CommandDefinition> = keyboardApi.map(
  ({ name, alias }) => {
    const commandName = alias || name;
    return {
      name: commandName,
      async run({ holly }, ...args: ReadonlyArray<any>) {
        const page = holly.__page;
        assertPageExists(page, commandName);
        // @ts-ignore
        await page.keyboard[name](...args);
        return page;
      },
      canRetry: false
    };
  }
);

export const chainedCommands: ReadonlyArray<CommandDefinition> = keyboardApi.map(
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
          assertElementType(pageOrElement, commandName);
        } else {
          assertPageOrElementType(pageOrElement, commandName);
        }

        const keyboard =
          pageOrElement instanceof Page
            ? pageOrElement.keyboard
            : pageOrElement;

        // @ts-ignore
        await keyboard[name](...args);
        return pageOrElement;
      },
      canRetry: false
    };
  }
);
