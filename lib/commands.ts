// import Debug from "debug";
import { ElementHandle, Page } from "playwright";
import matchInlineSnapshot from "./matchInlineSnapshot";
import { Holly, CommandDefinition } from "./types";
import { commandMatchers } from "./commandMatchers";
import * as mouseCommands from "./mouseCommands";
import { assertPageExists, assertElementType } from "./utils/assert";

// const debug = Debug("holly:commands");

export const rootCommands: ReadonlyArray<CommandDefinition> = [
  ...mouseCommands.rootCommands,
  {
    name: "$",
    run(holly: Holly, selector: string) {
      const page = assertPageExists(holly.__page, "$");
      return page.$(selector);
    }
  },
  {
    name: "pipe",
    run(holly: Holly, fn: () => any) {
      const page = assertPageExists(holly.__page, "pipe");
      return page.evaluate(fn);
    }
  },
  {
    name: "evaluate",
    run(holly: Holly, fn: () => any) {
      const page = assertPageExists(holly.__page, "evaluate");
      return page.evaluate(fn);
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
  ...mouseCommands.chainedCommands,
  {
    name: "value",
    run(holly: Holly, element: ElementHandle) {
      assertElementType(element, "value");
      return element.evaluate(
        // @ts-ignore
        /* istanbul ignore next */ (elem: HTMLElement) => elem.value
      );
    }
  },
  matchInlineSnapshot,
  {
    name: "type",
    run(holly: Holly, element: ElementHandle, value: string) {
      assertElementType(element, "type");
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
    name: "text",
    run(holly: Holly, element: ElementHandle) {
      assertElementType(element, "type");
      return pipe(element, /* istanbul ignore next */ el => el.innerText);
    },
    canRetry: false
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
