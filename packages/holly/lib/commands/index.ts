import Debug from "debug";
import matchInlineSnapshot from "./matchInlineSnapshot";
import * as screenshotCommand from "./screenshot";
import {
  RootCommandDefinition,
  ChainedCommandDefinition,
  CommandResult
} from "../types";
import { commandMatchers } from "./commandMatchers";
import * as mouseCommands from "./mouseCommands";
import * as keyboardCommands from "./keyboardCommands";
import * as findElements from "./findElements";
import {
  assertRootPageExists,
  assertElementType,
  assertElementSet,
  assertPageSet
} from "../utils/assert";
import { Viewport } from "playwright-core/lib/types";
import toIstanbul from "./toIstanbul";
import { Page } from "playwright-core/lib/page";
import { ElementHandle } from "playwright-core/lib/dom";

const debug = Debug("holly:commands:index");

function anyToCommandResult(value: any): CommandResult {
  if (value instanceof Page) {
    return {
      valueType: "page",
      page: value
    };
  }
  if (value instanceof ElementHandle) {
    return {
      valueType: "element",
      element: value
    };
  }
  return {
    valueType: "value",
    value
  };
}

async function pipe(
  base: any,
  anyFn: Function,
  commandResult?: CommandResult,
  commandName: string = "pipe",
  ...args: ReadonlyArray<any>
): Promise<CommandResult> {
  let value;
  if (typeof base.evaluate === "function") {
    value = await base.evaluate(anyFn, ...args);
  } else {
    value = await anyFn(base);
  }
  return {
    valueType: "value",
    value,
    page: commandResult?.page,
    element: commandResult?.element,
    description: `${commandName}(${(commandResult &&
      commandResult.description) ||
      ""})`
  };
}

export const rootCommands: ReadonlyArray<RootCommandDefinition> = [
  ...mouseCommands.rootCommands,
  ...keyboardCommands.rootCommands,
  ...findElements.rootCommands,
  screenshotCommand.root,
  {
    name: "wrap",
    run(_, value: any): CommandResult {
      return anyToCommandResult(value);
    }
  },
  {
    name: "pipe",
    async run({ holly }, fn: unknown): Promise<CommandResult> {
      if (typeof fn !== "function") {
        throw new Error(`pipe expects a function as its argument`);
      }
      const page = holly.__page;
      assertRootPageExists(page, "pipe");

      return pipe(page, fn);
    }
  },
  {
    name: "evaluate",
    async run({ holly }, fn: unknown): Promise<CommandResult> {
      if (typeof fn !== "function") {
        throw new Error(`pipe expects a function as its argument`);
      }

      const page = holly.__page;
      assertRootPageExists(page, "evaluate");

      return pipe(page, fn);
    },
    canRetry: false
  },
  {
    name: "newPage",
    async run(
      { config, holly },
      url: unknown,
      viewport?: unknown
    ): Promise<CommandResult> {
      if (typeof url !== "string") {
        throw new Error(
          "expected a string to be passed as url in the first parameter to newPage"
        );
      }
      if (
        viewport &&
        // @ts-ignore
        (typeof viewport.width !== "number" ||
          // @ts-ignore
          typeof viewport.height !== "number")
      ) {
        throw new Error(
          "expected viewport to be passed in the second parameter to newPage"
        );
      }
      const page = await holly.__context.newPage();
      holly.__page = page;
      // here would go coverage etc.
      if (viewport) {
        // @ts-ignore
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
      return {
        valueType: "page",
        page
      };
    },
    canRetry: false
  },
  {
    name: "setViewportSize",
    async run({ holly }, viewport: Viewport): Promise<CommandResult> {
      if (
        !viewport ||
        typeof viewport.width !== "number" ||
        typeof viewport.height !== "number"
      ) {
        throw new Error(
          "expected viewport to be passed in the first parameter to setViewportSize"
        );
      }

      const page = holly.__page;
      assertRootPageExists(page, "setViewportSize");

      await page.setViewportSize(viewport);
      return {
        valueType: "page",
        page
      };
    },
    canRetry: false
  }
];

export const chainedCommands: ReadonlyArray<ChainedCommandDefinition> = [
  ...commandMatchers,
  ...mouseCommands.chainedCommands,
  ...keyboardCommands.chainedCommands,
  ...findElements.chainedCommands,
  screenshotCommand.chained,
  {
    name: "value",
    async run(_, commandResult: CommandResult): Promise<CommandResult> {
      assertElementType(commandResult, "value");
      const element = commandResult.element;
      assertElementSet(element, commandResult, "value");
      const value = await element.evaluate(
        // @ts-ignore
        /* istanbul ignore next */ (elem: HTMLElement) => elem.value
      );
      return {
        valueType: "value",
        value,
        page: commandResult.page,
        element: commandResult.element,
        description: `value(${commandResult.description})`
      };
    }
  },
  {
    name: "focus",
    async run(_, commandResult: CommandResult): Promise<CommandResult> {
      assertElementType(commandResult, "focus");
      const element = commandResult.element;
      assertElementSet(element, commandResult, "focus");

      await element.focus();
      return commandResult;
    }
  },
  {
    name: "hover",
    async run(_, commandResult: CommandResult, options: unknown) {
      assertElementType(commandResult, "focus");
      const element = commandResult.element;
      assertElementSet(element, commandResult, "focus");
      if (options !== undefined && typeof options !== "object") {
        throw new Error(
          "expected first argument to hover to be an object - PointerActionOptions"
        );
      }

      await element.hover(
        // @ts-ignore
        options
      );
      return commandResult;
    }
  },
  {
    name: "scrollIntoViewIfNeeded",
    async run(_, commandResult: CommandResult) {
      assertElementType(commandResult, "scrollIntoViewIfNeeded");
      const element = commandResult.element;
      assertElementSet(element, commandResult, "scrollIntoViewIfNeeded");

      await element.scrollIntoViewIfNeeded();
      return commandResult;
    }
  },
  matchInlineSnapshot,
  {
    name: "pipe",
    run(_, commandResult: CommandResult, fn: unknown): Promise<CommandResult> {
      if (typeof fn !== "function") {
        throw new Error(
          "Expected a function passed into the first argument of pipe"
        );
      }
      let pipeBase;
      if (commandResult.valueType === "page") {
        pipeBase = commandResult.page;
        assertPageSet(pipeBase, commandResult, "pipe");
      } else if (commandResult.valueType === "element") {
        pipeBase = commandResult.element;
        assertElementSet(pipeBase, commandResult, "pipe");
      } else {
        pipeBase = commandResult.value;
      }
      return pipe(pipeBase, fn, commandResult);
    }
  },
  {
    name: "evaluate",
    run(_, commandResult: CommandResult, fn: unknown): Promise<CommandResult> {
      if (typeof fn !== "function") {
        throw new Error(
          "Expected a function passed into the first argument of pipe"
        );
      }
      let pipeBase;
      if (commandResult.valueType === "page") {
        pipeBase = commandResult.page;
        assertPageSet(pipeBase, commandResult, "pipe");
      } else if (commandResult.valueType === "element") {
        pipeBase = commandResult.element;
        assertElementSet(pipeBase, commandResult, "pipe");
      } else {
        pipeBase = commandResult.value;
      }
      return pipe(pipeBase, fn, commandResult);
    },
    canRetry: false
  },
  {
    name: "getAttribute",
    async run(
      _,
      commandResult: CommandResult,
      attrName: string
    ): Promise<CommandResult> {
      if (!attrName && typeof attrName !== "string") {
        throw new Error(
          "Expected the first argument of getAttribute to be a string - the attribute name."
        );
      }

      assertElementType(commandResult, "getAttribute");
      const element = commandResult.element;
      assertElementSet(element, commandResult, "getAttribute");

      return await pipe(
        element,
        // @ts-ignore
        /* istanbul ignore next */ (el, attrName) => el.getAttribute(attrName),
        commandResult,
        "text",
        attrName
      );
    }
  },
  {
    name: "text",
    async run(_, commandResult: CommandResult): Promise<CommandResult> {
      assertElementType(commandResult, "text");
      const element = commandResult.element;
      assertElementSet(element, commandResult, "text");

      return await pipe(
        element,
        // @ts-ignore
        /* istanbul ignore next */ el => el.innerText,
        commandResult,
        "text"
      );
    }
  },
  {
    name: "textArray",
    async run(_, commandResult: CommandResult): Promise<CommandResult> {
      assertElementType(commandResult, "text");
      const element = commandResult.element;
      assertElementSet(element, commandResult, "text");

      return await pipe(
        element,
        // @ts-ignore
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
        },
        commandResult,
        "textArray"
      );
    }
  }
];
