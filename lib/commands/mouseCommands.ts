import { ElementHandle } from "playwright";
import { Page } from "playwright-core/lib/page";
import {
  assertPageExists,
  assertPageType,
  assertElementType
} from "./utils/assert";
import { Holly, CommandDefinition } from "./types";

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

const runPageMouseCommand = async (
  cmdName: string,
  page: Page,
  ...args: ReadonlyArray<any>
) => {
  // @ts-ignore
  await page.mouse[cmdName](...args);
  return page;
};

export const rootCommands: ReadonlyArray<CommandDefinition> = mouseApi.map(
  ({ name, alias }) => {
    const commandName = alias || name;
    return {
      name: commandName,
      run(holly: Holly, ...args: ReadonlyArray<any>) {
        const page = assertPageExists(holly.__page, commandName);
        return runPageMouseCommand(name, page, ...args);
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
        holly: Holly,
        pageOrElement: Page | ElementHandle,
        ...args: ReadonlyArray<any>
      ) {
        if (!isElement || pageOrElement instanceof Page) {
          const page = assertPageType(pageOrElement, commandName);
          return runPageMouseCommand(name, page, ...args);
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
