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

const keyboardApi = [
  {
    name: "type",
    availableOnPage: true,
    availableOnElement: true
  },
  {
    name: "up",
    alias: "keyup",
    availableOnPage: true,
    availableOnElement: false
  },
  {
    name: "down",
    alias: "keydown",
    availableOnPage: true,
    availableOnElement: false
  },
  {
    name: "press",
    alias: "keypress",
    availableOnPage: true,
    availableOnElement: true
  },
  { name: "sendCharacters", availableOnPage: true, availableOnElement: false }
];

export const rootCommands: ReadonlyArray<RootCommandDefinition> = keyboardApi.map(
  ({ name, alias }) => {
    const commandName = alias || name;
    return {
      name: commandName,
      async run(
        { holly },
        ...args: ReadonlyArray<any>
      ): Promise<CommandResult> {
        const page = holly.__page;
        assertRootPageExists(page, commandName);
        // @ts-ignore
        await page.keyboard[name](...args);
        return {
          valueType: "page",
          page
        };
      },
      canRetry: false
    };
  }
);

export const chainedCommands: ReadonlyArray<ChainedCommandDefinition> = keyboardApi.map(
  ({ name, availableOnElement, alias }) => {
    const commandName = alias || name;
    return {
      name: commandName,
      async run(_, commandResult: CommandResult, ...args: ReadonlyArray<any>) {
        let keyboard;
        if (!availableOnElement) {
          assertPageType(commandResult, commandName);
        } else {
          assertPageOrElementType(commandResult, commandName);
        }
        if (commandResult.valueType === "page") {
          const page = commandResult.page;
          assertPageSet(page, commandResult, commandName);
          keyboard = page.keyboard;
        } else {
          const element = commandResult.element;
          assertElementSet(element, commandResult, commandName);
          keyboard = element;
        }

        // @ts-ignore
        await keyboard[name](...args);
        return commandResult;
      },
      canRetry: false
    };
  }
);
