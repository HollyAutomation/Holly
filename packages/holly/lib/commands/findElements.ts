import { Page } from "playwright-core/lib/page";
import { assertPageExists, assertPageOrElementType } from "../utils/assert";
import { CommandDefinition } from "../types";

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

export const rootCommands: ReadonlyArray<CommandDefinition> = [
  {
    name: "$",
    run({ holly }, selector: string) {
      const page = holly.__page;
      assertPageExists(page, "$");

      return page.$(selector);
    }
  },
  {
    name: "byText",
    async run({ holly }, text: string) {
      const page = holly.__page;
      assertPageExists(page, "byText");
      const jsHandle = await page.evaluateHandle(byText, null, text);
      return jsHandle?.asElement();
    }
  }
];

export const chainedCommands: ReadonlyArray<CommandDefinition> = [
  {
    name: "$",
    run(_, pageOrElement: any, selector: string) {
      assertPageOrElementType(pageOrElement, "$");
      return pageOrElement.$(selector);
    }
  },
  {
    name: "byText",
    async run(_, pageOrElement: any, text: string) {
      assertPageOrElementType(pageOrElement, "byText");
      const jsHandle =
        pageOrElement instanceof Page
          ? await pageOrElement.evaluateHandle(byText, null, text)
          : await pageOrElement.evaluateHandle(byText, text);
      return jsHandle?.asElement();
    }
  }
];
