// import Debug from "debug";
import { ElementHandle, Page } from "playwright";
import matchInlineSnapshot from "./matchInlineSnapshot";
import { Holly, CommandDefinition } from "./types";
import { commandMatchers } from "./commandMatchers";

// const debug = Debug("holly:commands");

export const rootCommands: ReadonlyArray<CommandDefinition> = [
  {
    name: "$",
    run(holly: Holly, selector: string) {
      if (!holly.__page) {
        throw new Error(
          "Go to a page before selecting an element (holly.newPage)"
        );
      }
      return holly.__page.$(selector);
    }
  },
  {
    name: "pipe",
    run(holly: Holly, fn: () => any) {
      if (!holly.__page) {
        throw new Error("Go to a page before using pipe (holly.newPage)");
      }
      return holly.__page.evaluate(fn);
    }
  },
  {
    name: "evaluate",
    run(holly: Holly, fn: () => any) {
      if (!holly.__page) {
        throw new Error("Go to a page before using evaluate (holly.newPage)");
      }
      return holly.__page.evaluate(fn);
    },
    canRetry: false
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

function pipe(base: any, anything: (anything?: any) => any) {
  if (typeof base.evaluate === "function") {
    return base.evaluate(anything);
  }
  return anything(base);
}

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
  },
  {
    name: "pipe",
    run(
      holly: Holly,
      elementOrPage: ElementHandle | Page | any,
      fn: () => any
    ) {
      return pipe(elementOrPage, fn);
    }
  },
  {
    name: "evaluate",
    run(
      holly: Holly,
      elementOrPage: ElementHandle | Page | any,
      fn: () => any
    ) {
      return pipe(elementOrPage, fn);
    },
    canRetry: false
  }
];
