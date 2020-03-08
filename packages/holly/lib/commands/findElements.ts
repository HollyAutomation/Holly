import {
  assertRootPageExists,
  assertPageOrElementType,
  assertPageSet,
  assertElementSet
} from "../utils/assert";
import {
  RootCommandDefinition,
  ChainedCommandDefinition,
  CommandResult
} from "../types";

const byText = /* istanbul ignore next */ (
  element: Node | null,
  text: string
) => {
  function count(haystack: string, needle: string): number {
    let count = 0;
    let i = 0;
    while (i < haystack.length) {
      i = haystack.indexOf(needle, i);
      if (i < 0) {
        break;
      }
      count++;
      i += needle.length;
    }
    return count;
  }
  function searchNodes(node: Node): ReadonlyArray<HTMLElement> {
    let foundNodes: Array<HTMLElement> = [];
    if (node instanceof HTMLElement) {
      const instancesInChildren = count(
        node.innerText.replace(/\s+/g, " "),
        text
      );
      if (instancesInChildren > 0) {
        for (let i = 0; i < node.children.length; i++) {
          foundNodes = foundNodes.concat(searchNodes(node.children[i]));
        }
        if (foundNodes.length < instancesInChildren) {
          foundNodes.push(node);
        }
      }
    }
    return foundNodes;
  }
  text = text.replace(/\s+/g, " ");
  const foundNodes = searchNodes(element || document.body);
  return foundNodes.length <= 1 ? foundNodes[0] : foundNodes;
};

export const rootCommands: ReadonlyArray<RootCommandDefinition> = [
  {
    name: "$",
    async run({ holly }, selector: unknown): Promise<CommandResult> {
      if (!selector || typeof selector !== "string") {
        throw new Error("expected a selector of type string to be passed to $");
      }
      const page = holly.__page;
      assertRootPageExists(page, "$");

      const element = await page.$(selector);
      return {
        valueType: "element",
        element,
        description: selector
      };
    }
  },
  {
    name: "byText",
    async run({ holly }, text: unknown): Promise<CommandResult> {
      if (!text || typeof text !== "string") {
        throw new Error("expected text of type string to be passed to byText");
      }

      const page = holly.__page;
      assertRootPageExists(page, "byText");

      const jsHandle = await page.evaluateHandle(byText, null, text);
      const element = await jsHandle?.asElement();
      return {
        valueType: "element",
        element,
        description: `:byText('${text}')`
      };
    }
  }
];

export const chainedCommands: ReadonlyArray<ChainedCommandDefinition> = [
  {
    name: "$",
    async run(
      _,
      commandResult: CommandResult,
      selector: unknown
    ): Promise<CommandResult> {
      if (!selector || typeof selector !== "string") {
        throw new Error("expected a selector of type string to be passed to $");
      }

      assertPageOrElementType(commandResult, "$");

      let element;
      if (commandResult.valueType === "page") {
        const page = commandResult.page;
        assertPageSet(page, commandResult, "$");
        element = await page.$(selector);
      } else {
        const parentElement = commandResult.element;
        assertElementSet(parentElement, commandResult, "$");
        element = await parentElement.$(selector);
      }

      return {
        valueType: "element",
        element,
        description:
          (commandResult.description ? commandResult.description + " " : "") +
          selector
      };
    }
  },
  {
    name: "byText",
    async run(
      _,
      commandResult: CommandResult,
      text: unknown
    ): Promise<CommandResult> {
      if (!text || typeof text !== "string") {
        throw new Error("expected text of type string to be passed to byText");
      }

      assertPageOrElementType(commandResult, "byText");

      let jsHandle;
      if (commandResult.valueType === "page") {
        const page = commandResult.page;
        assertPageSet(page, commandResult, "$");
        jsHandle = await page.evaluateHandle(byText, null, text);
      } else {
        const parentElement = commandResult.element;
        assertElementSet(parentElement, commandResult, "$");
        jsHandle = await parentElement.evaluateHandle(byText, text);
      }

      return {
        valueType: "element",
        element: jsHandle?.asElement(),
        description:
          (commandResult.description ? commandResult.description + " " : "") +
          `:byText('${text}')`
      };
    }
  }
];
