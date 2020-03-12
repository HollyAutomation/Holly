import {
  assertRootPageExists,
  assertPageOrElementType,
  assertPageType,
  assertPageSet,
  assertElementSet
} from "../utils/assert";
import {
  RootCommandDefinition,
  ChainedCommandDefinition,
  CommandResult
} from "../types";

const mouseApi = [
  {
    name: "click",
    availableOnPage: true,
    availableOnElement: true
  },
  { name: "dblclick", availableOnPage: true, availableOnElement: true },
  {
    name: "down",
    alias: "mousedown",
    availableOnPage: true,
    availableOnElement: false
  },
  {
    name: "move",
    alias: "mousemove",
    availableOnPage: true,
    availableOnElement: false
  },
  { name: "tripleclick", iavailableOnPage: true, availableOnElement: true },
  {
    name: "up",
    alias: "mouseup",
    availableOnPage: true,
    availableOnElement: false
  }
];

export const rootCommands: ReadonlyArray<RootCommandDefinition> = mouseApi.map(
  ({ name, alias }) => {
    const commandName = alias || name;
    return {
      name: commandName,
      async run(
        { holly },
        ...args: ReadonlyArray<unknown>
      ): Promise<CommandResult> {
        const page = holly.__page;
        assertRootPageExists(page, commandName);
        // @ts-ignore
        await page.mouse[name](...args);
        return {
          valueType: "page",
          page
        };
      },
      canRetry: false
    };
  }
);

export const chainedCommands: ReadonlyArray<ChainedCommandDefinition> = mouseApi.map(
  ({ name, availableOnElement, alias }) => {
    const commandName = alias || name;
    return {
      name: commandName,
      async run(
        _,
        commandResult: CommandResult,
        ...args: ReadonlyArray<any>
      ): Promise<CommandResult> {
        let mouse;
        if (!availableOnElement) {
          assertPageType(commandResult, commandName);
        } else {
          assertPageOrElementType(commandResult, commandName);
        }
        if (commandResult.valueType === "page") {
          const page = commandResult.page;
          assertPageSet(page, commandResult, commandName);
          mouse = page.mouse;
        } else {
          const element = commandResult.element;
          assertElementSet(element, commandResult, commandName);
          mouse = element;
        }

        // @ts-ignore
        await mouse[name](...args);
        return commandResult;
      },
      canRetry: false
    };
  }
);
