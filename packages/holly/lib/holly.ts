import Debug from "debug";
import milliseconds = require("ms");
import { chainedCommands, rootCommands } from "./commands";
import {
  Holly,
  CommandInstance,
  HollyChainAwaitable,
  HollyChain,
  CommandDefinition,
  Config,
  HollyListener
} from "./types";
import { asymmetricMatchers } from "./commands/commandMatchers";
import parseTime from "./utils/parseTime";
import { BrowserContext } from "playwright";

const DEFAULT_RETRY_DELAY = milliseconds("20ms");
const DEFAULT_MAX_RETRY = milliseconds("5s");

const debug = Debug("holly:holly");

export default function createHolly(
  config: Config,
  listener: HollyListener | void
): Holly {
  const retryDelayMs = parseTime(config.retryDelay, DEFAULT_RETRY_DELAY);
  const maxRetryTime = parseTime(config.maxRetryTime, DEFAULT_MAX_RETRY);

  const retryDelay = () =>
    new Promise(resolve => setTimeout(resolve, retryDelayMs));

  // @ts-ignore
  const holly: Holly = {
    __page: null,
    ...asymmetricMatchers
  };

  const chainedCommandsBase = {
    then(resolve: (chain: HollyChain) => void, reject: (error: Error) => void) {
      const previousCommandInstance: CommandInstance =
        // @ts-ignore
        this.__currentCommandInstance;
      holly.__executeSoFar().then(() => {
        // return a new chainable but remove the then
        // function otherwise we get stuck in a loop
        // constantly resolving ourself.
        const { then, ...newChainInstance } = createNewChainInstance({
          ...previousCommandInstance,
          retry: null
        });
        newChainInstance.and = newChainInstance;
        resolve(newChainInstance);
      }, reject);
    }
  };

  function createNewChainInstance(
    commandInstance: CommandInstance
  ): HollyChainAwaitable {
    const newChainInstance = {
      ...chainedCommandsBase,
      __currentCommandInstance: commandInstance
    };
    // @ts-ignore
    newChainInstance.and = newChainInstance;
    // @ts-ignore
    return newChainInstance;
  }

  function createChainedCommand(command: CommandDefinition) {
    return function(...args: ReadonlyArray<any>) {
      // @ts-ignore
      const parent: CommandInstance = this.__currentCommandInstance;
      debug(
        `adding chained command '${command.name}' from '${parent.command.name}'`
      );
      const error = new Error();
      // @ts-ignore assume stack is always not undefined
      const stack: string = error.stack;
      const commandInstance: CommandInstance = {
        parent,
        command,
        args,
        stack,
        children: []
      };
      parent.children.push(commandInstance);
      holly.__commands.push(commandInstance);
      if (listener) {
        listener.onCommand({
          test: holly.__currentTest,
          commandName: command.name,
          id: holly.__commands.length - 1
        });
      }
      return createNewChainInstance(commandInstance);
    };
  }

  chainedCommands.forEach(command => {
    // @ts-ignore
    chainedCommandsBase[command.name] = createChainedCommand(command);
  });

  function createInitialCommand(command: CommandDefinition) {
    return (...args: ReadonlyArray<any>) => {
      debug(`adding root command '${command.name}'`);
      const error = new Error();
      // @ts-ignore
      const stack: string = error.stack;
      const commandInstance = {
        command,
        args,
        stack,
        children: []
      };
      holly.__rootCommands.push(commandInstance);
      holly.__commands.push(commandInstance);
      return createNewChainInstance(commandInstance);
    };
  }

  rootCommands.forEach(command => {
    // @ts-ignore
    holly[command.name] = createInitialCommand(command);
  });

  async function runCommand(commandInstance: CommandInstance): Promise<any> {
    debug(`Running command '${commandInstance.command.name}'`);
    try {
      const result = await (commandInstance.parent
        ? commandInstance.command.run(
            { holly, commandInstance, test: holly.__currentTest, config },
            // @ts-ignore - hard to type check
            commandInstance.parent.result,
            ...commandInstance.args
          )
        : commandInstance.command.run(
            { holly, commandInstance, test: holly.__currentTest, config },
            // @ts-ignore - hard to type check
            ...commandInstance.args
          ));
      commandInstance.result = result;
      if (commandInstance.command.canRetry !== false) {
        commandInstance.retry = async () => {
          if (commandInstance.parent && commandInstance.parent.retry) {
            await commandInstance.parent.retry();
          }
          return runCommand(commandInstance);
        };
      }
    } catch (e) {
      const doRetry = commandInstance.parent && commandInstance.parent.retry;
      const retryStartTime =
        commandInstance.retryStartTime || Number.MAX_SAFE_INTEGER;
      const hasTimedOut = Date.now() - retryStartTime > maxRetryTime;

      if (doRetry && !hasTimedOut) {
        if (!commandInstance.retryStartTime) {
          commandInstance.retryStartTime = Date.now();
        }

        debug(
          `exception '${e}' so retrying command '${commandInstance.command.name}'`
        );
        await retryDelay();
        await doRetry();
        return runCommand(commandInstance);
      } else {
        // TODO - special case an element so the error can be element can not be found
        let toThrow: { message?: string | void; stack?: string | void } = {};
        if (typeof e.message === "function") {
          toThrow.message = e.message();
        } else {
          toThrow.message = e.message;
        }
        toThrow.stack = commandInstance.stack;
        debug(
          `failure with no parent or retry available so just re-throwing '${commandInstance.command.name}' '${toThrow.message}'`
        );
        throw toThrow;
      }
    }
  }

  holly.__start = (context: BrowserContext, test: Mocha.Test) => {
    debug("starting test");
    if (holly.__page) {
      throw new Error("unexpected test not cleaned up");
    }
    holly.__context = context;
    holly.__rootCommands = [];
    holly.__commands = [];
    holly.__currentTest = test;
    holly.__currentTestState = {};
    holly.__afterTestHooks = [];
  };
  holly.__end = async () => {
    debug("ending test");
    while (holly.__afterTestHooks.length) {
      const fn = holly.__afterTestHooks.pop();
      await fn?.();
    }

    if (holly.__page) {
      debug("ending test - closing page");
      await holly.__page.close();
      holly.__page = null;
    }
  };
  holly.__executeSoFar = async () => {
    debug("executing so far");
    const commands = holly.__commands;
    try {
      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        await runCommand(command);
      }
    } finally {
      holly.__commands.length = 0;
      debug("all commands executed");
    }
  };

  return holly;
}
