import { ElementHandle } from "playwright";
import { Page } from "playwright-core/lib/page";
import {
  assertPageExists,
  assertPageType,
  assertElementType
} from "../utils/assert";
import { Holly, CommandDefinition } from "../types";

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

const runPageKeyboardCommand = async (
  cmdName: string,
  page: Page,
  ...args: ReadonlyArray<any>
) => {
  // @ts-ignore
  await page.keyboard[cmdName](...args);
  return page;
};

export const rootCommands: ReadonlyArray<CommandDefinition> = keyboardApi.map(
  ({ name, alias }) => {
    const commandName = alias || name;
    return {
      name: commandName,
      run(holly: Holly, ...args: ReadonlyArray<any>) {
        const page = assertPageExists(holly.__page, commandName);
        return runPageKeyboardCommand(name, page, ...args);
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
        holly: Holly,
        pageOrElement: Page | ElementHandle,
        ...args: ReadonlyArray<any>
      ) {
        if (!isElement || pageOrElement instanceof Page) {
          const page = assertPageType(pageOrElement, commandName);
          return runPageKeyboardCommand(name, page, ...args);
        }
        const el = assertElementType(pageOrElement, commandName, " or a page");
        // @ts-ignore
        await el[name](...args);
        return el;
      },
      canRetry: false
    };
  }
);
