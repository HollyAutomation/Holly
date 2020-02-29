import { ElementHandle, Page } from "playwright";
import Debug from "debug";
import matchInlineSnapshot from "./matchInlineSnapshot";
import * as screenshotCommand from "./screenshot";
import { CommandDefinition } from "../types";
import { commandMatchers } from "./commandMatchers";
import * as mouseCommands from "./mouseCommands";
import * as keyboardCommands from "./keyboardCommands";
import * as findElements from "./findElements";
import { assertPageExists, assertElementType } from "../utils/assert";
import { Viewport } from "playwright-core/lib/types";
import { PointerActionOptions } from "playwright-core/lib/input";
import toIstanbul from "./toIstanbul";

const debug = Debug("holly:commands:index");

export const rootCommands: ReadonlyArray<CommandDefinition> = [
  ...mouseCommands.rootCommands,
  ...keyboardCommands.rootCommands,
  ...findElements.rootCommands,
  screenshotCommand.root,
  {
    name: "wrap",
    run(_, value: any) {
      return value;
    }
  },
  {
    name: "pipe",
    run({ holly }, fn: () => any) {
      const page = holly.__page;
      assertPageExists(page, "pipe");

      return page.evaluate(fn);
    }
  },
  {
    name: "evaluate",
    run({ holly }, fn: () => any) {
      const page = holly.__page;
      assertPageExists(page, "evaluate");

      return page.evaluate(fn);
    },
    canRetry: false
  },
  {
    name: "newPage",
    async run({ config, holly }, url: string, viewport?: Viewport) {
      const page = await holly.__context.newPage();
      holly.__page = page;
      // here would go coverage etc.
      if (viewport) {
        await page.setViewportSize(viewport);
      }
      if (config.pipeConsole !== false) {
        page.on("console", msg => console.log("page:", msg.text()));
      }
      if (config.coverage) {
        await page.coverage?.startJSCoverage();
        holly.__afterTestHooks.push(async () => {
          try {
            const jsCov = await page.coverage?.stopJSCoverage();
            if (jsCov) {
              await toIstanbul(jsCov, {
                sourceRoot: config.sourceRoot,
                servedBasePath: config.servedBasePath
              });
            }
          } catch (e) {
            debug(`Failed to generate coverage '${e.message}' '${e.stack}'`);
            throw new Error("Failed to generate coverage");
          }
        });
      }
      await page.goto(url);
      return page;
    },
    canRetry: false
  },
  {
    name: "setViewportSize",
    async run({ holly }, viewport: Viewport) {
      const page = holly.__page;
      assertPageExists(page, "setViewportSize");

      await page.setViewportSize(viewport);
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
  ...findElements.chainedCommands,
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
      assertElementType(element, "text");
      return pipe(element, /* istanbul ignore next */ el => el.innerText);
    }
  },
  {
    name: "textArray",
    run(_, element: ElementHandle) {
      assertElementType(element, "textArray");
      return pipe(
        element,
        /* istanbul ignore next */ el => {
          type TextArray = string | Array<TextArray>;
          function getTextArray(node: ChildNode | null) {
            const textNodes: TextArray = [];
            if (!node) {
              return textNodes;
            }
            for (node = node.firstChild; node; node = node.nextSibling) {
              if (node.nodeType == 3) {
                if (node.textContent) {
                  textNodes.push(node.textContent);
                }
              } else {
                const subNodes = getTextArray(node);
                if (subNodes.length > 0) {
                  textNodes.push(subNodes);
                }
              }
            }
            if (textNodes.length === 1) {
              return textNodes[0];
            }
            return textNodes;
          }
          return getTextArray(el);
        }
      );
    }
  },
  {
    name: "evaluate",
    run(_, elementOrPage: any, fn: () => any) {
      return pipe(elementOrPage, fn);
    },
    canRetry: false
  }
];
