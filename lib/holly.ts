import Debug from "debug";
import { chainedCommands, rootCommands } from "./commands";
import {
  Holly,
  CommandInstance,
  HollyChainAwaitable,
  HollyChain,
  CommandDefinition
} from "./types";

const debug = Debug("holly:holly");

const retryDelay = () => new Promise(resolve => setTimeout(resolve, 50));

function last<T>(ar: ReadonlyArray<T>): T {
  return ar[ar.length - 1];
}

export default function createHolly(): Holly {
  // @ts-ignore
  const holly: Holly = {
    __page: null
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
        resolve(newChainInstance);
      }, reject);
    }
  };

  function createNewChainInstance(
    commandInstance: CommandInstance
  ): HollyChainAwaitable {
    // @ts-ignore
    return {
      ...chainedCommandsBase,
      __currentCommandInstance: commandInstance
    };
  }

  function getRootCommand(commandInstance: CommandInstance) {
    while (commandInstance.parent) {
      commandInstance = commandInstance.parent;
    }
    return commandInstance;
  }

  function createChainedCommand(command: CommandDefinition) {
    return function(...args: ReadonlyArray<any>) {
      // @ts-ignore
      const parent: CommandInstance = this.__currentCommandInstance;
      debug(
        `adding chained command '${command.name}' from '${parent.command.name}'`
      );
      if (getRootCommand(parent) !== last(holly.__rootCommands)) {
        throw new Error("do not use holly out of context");
      }
      if (command.captureStack) {
        const error = new Error();
        args = [error.stack, ...args];
      }
      const commandInstance: CommandInstance = {
        parent,
        command,
        args,
        children: []
      };
      parent.children.push(commandInstance);
      holly.__commands.push(commandInstance);
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
      if (command.captureStack) {
        const error = new Error();
        args = [error.stack, ...args];
      }
      const commandInstance = {
        command,
        args,
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
    let args = commandInstance.args;
    if (commandInstance.parent) {
      args = [commandInstance.parent.result, ...args];
    }
    try {
      const result = await commandInstance.command.run(holly, ...args);
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
      if (commandInstance.parent && commandInstance.parent.retry) {
        debug(
          `exception '${e}' so retrying command '${commandInstance.command.name}'`
        );
        await retryDelay();
        await commandInstance.parent.retry();
        return runCommand(commandInstance);
      } else {
        debug(
          `failure with no parent so just re-throwing '${commandInstance.command.name}'`
        );
        throw e;
      }
    }
  }

  holly.__start = context => {
    if (holly.__page) {
      holly.__page.close();
      holly.__page = null;
    }
    holly.__context = context;
    holly.__rootCommands = [];
    holly.__commands = [];
  };
  holly.__executeSoFar = async () => {
    debug("executing so far");
    const commands = holly.__commands;
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      await runCommand(command);
    }
    holly.__commands.length = 0;
    debug("all commands executed");
  };

  return holly;
}
