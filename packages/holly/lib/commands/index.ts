import { ElementHandle, Page } from "playwright";
import matchInlineSnapshot from "./matchInlineSnapshot";
import * as screenshotCommand from "./screenshot";
import { CommandDefinition } from "../types";
import { commandMatchers } from "./commandMatchers";
import * as mouseCommands from "./mouseCommands";
import * as keyboardCommands from "./keyboardCommands";
import { assertPageExists, assertElementType } from "../utils/assert";
import { Viewport } from "playwright-core/lib/types";
import { PointerActionOptions } from "playwright-core/lib/input";

export const rootCommands: ReadonlyArray<CommandDefinition> = [
  ...mouseCommands.rootCommands,
  ...keyboardCommands.rootCommands,
  screenshotCommand.root,
  {
    name: "wrap",
    run(_, value: any) {
      return value;
    }
  },
  {
    name: "$",
    run({ holly }, selector: string) {
      const page = assertPageExists(holly.__page, "$");
      return page.$(selector);
    }
  },
  {
    name: "pipe",
    run({ holly }, fn: () => any) {
      const page = assertPageExists(holly.__page, "pipe");
      return page.evaluate(fn);
    }
  },
  {
    name: "evaluate",
    run({ holly }, fn: () => any) {
      const page = assertPageExists(holly.__page, "evaluate");
      return page.evaluate(fn);
    },
    canRetry: false
  },
  {
    name: "newPage",
    async run(x, url: string, viewport?: Viewport) {
      const holly = x.holly;
      const page = await holly.__context.newPage();
      holly.__page = page;
      // here would go coverage etc.
      if (viewport) {
        await page.setViewport(viewport);
      }
      await page.goto(url);
      return page;
    },
    canRetry: false
  },
  {
    name: "setViewport",
    async run({ holly }, viewport: Viewport) {
      const page = assertPageExists(holly.__page, "setViewport");
      await page.setViewport(viewport);
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
  ...keyboardCommands.chainedCommands,
  screenshotCommand.chained,
  {
    name: "value",
    run(_, element: ElementHandle) {
      assertElementType(element, "value");
      return element.evaluate(
        // @ts-ignore
        /* istanbul ignore next */ (elem: HTMLElement) => elem.value
      );
    }
  },
  {
    name: "focus",
    run(_, element: ElementHandle) {
      assertElementType(element, "value");
      return element.focus();
    }
  },
  {
    name: "hover",
    run(_, element: ElementHandle, options: PointerActionOptions) {
      assertElementType(element, "value");
      return element.hover(options);
    }
  },
  {
    name: "scrollIntoViewIfNeeded",
    run(_, element: ElementHandle) {
      assertElementType(element, "value");
      return element.scrollIntoViewIfNeeded();
    }
  },
  matchInlineSnapshot,
  {
    name: "pipe",
    run(_, elementOrPage: ElementHandle | Page | any, fn: () => any) {
      return pipe(elementOrPage, fn);
    }
  },
  {
    name: "text",
    run(_, element: ElementHandle) {
      assertElementType(element, "type");
      return pipe(element, /* istanbul ignore next */ el => el.innerText);
    }
  },
  {
    name: "evaluate",
    run(_, elementOrPage: ElementHandle | Page | any, fn: () => any) {
      return pipe(elementOrPage, fn);
    },
    canRetry: false
  }
];