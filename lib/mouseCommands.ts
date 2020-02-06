import { ElementHandle } from "playwright";
import { Page } from "playwright-core/lib/page";
import {
  assertPageExists,
  assertPageType,
  assertElementType
} from "./utils/assert";
import { Holly, CommandDefinition } from "./types";

// api from playwright:
// mouse.click(x, y[, options])
// mouse.dblclick(x, y[, options])
// mouse.down([options])
// mouse.move(x, y[, options])
// mouse.tripleclick(x, y[, options])
// mouse.up([options])

const mouseApi = [
  {
    name: "click",
    isPage: true,
    isElement: true
  },
  { name: "dblclick", isPage: true, isElement: true },
  { name: "down", isPage: true, isElement: false },
  { name: "move", isPage: true, isElement: false },
  { name: "tripleclick", isPage: true, isElement: true },
  { name: "up", isPage: true, isElement: false }
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
  ({ name }) => {
    return {
      name,
      run(holly: Holly, ...args: ReadonlyArray<any>) {
        const page = assertPageExists(holly.__page, name);
        return runPageMouseCommand(name, page, ...args);
      },
      canRetry: false
    };
  }
);

export const chainedCommands: ReadonlyArray<CommandDefinition> = mouseApi.map(
  ({ name, isElement }) => {
    return {
      name,
      async run(
        holly: Holly,
        pageOrElement: Page | ElementHandle,
        ...args: ReadonlyArray<any>
      ) {
        if (!isElement || pageOrElement instanceof Page) {
          const page = assertPageType(pageOrElement, name);
          return runPageMouseCommand(name, page, ...args);
        }
        const el = assertElementType(pageOrElement, name, " or a page");
        // @ts-ignore
        await el[name](...args);
        return el;
      },
      canRetry: false
    };
  }
);
