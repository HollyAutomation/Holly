// import Debug from "debug";
import { ElementHandle } from "playwright";
import matchInlineSnapshot from "./matchInlineSnapshot";
import { Holly, CommandDefinition } from "./types";
import { commandMatchers } from "./commandMatchers";

// const debug = Debug("holly:commands");

export const rootCommands: ReadonlyArray<CommandDefinition> = [
  {
    name: "$",
    run(holly: Holly, selector: string) {
      if (!holly.__page) {
        throw new Error("Selecting element before visiting a page");
      }
      return holly.__page.$(selector);
    }
  },
  {
    name: "newPage",
    async run(holly: Holly, url: string) {
      const page = await holly.__context.newPage("about:blank");
      holly.__page = page;
      // here would go coverage etc.
      await page.goto(url);
      return page;
    },
    canRetry: false
  }
];

export const chainedCommands: ReadonlyArray<CommandDefinition> = [
  ...commandMatchers,
  {
    name: "value",
    run(holly: Holly, element: ElementHandle) {
      // @ts-ignore
      return element.evaluate((elem: HTMLElement) => elem.value);
    }
  },
  matchInlineSnapshot,
  {
    name: "type",
    run(holly: Holly, element: ElementHandle, value: string) {
      return element.type(value);
    },
    canRetry: false
  }
];
