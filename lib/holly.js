const debug = require("debug")("holly:holly");
const { chainedCommands, rootCommands } = require("./commands");

const retryDelay = () => new Promise(resolve => setTimeout(resolve, 50));

function last(ar) {
  return ar[ar.length - 1];
}

module.exports = function createHolly() {
  const holly = {
    __page: null
  };

  const chainedCommandsBase = {};

  function createNewBase(chainBase) {
    return { ...chainedCommandsBase, __base: chainBase };
  }

  function getRootFromBase(base) {
    while (base.parent) {
      base = base.parent;
    }
    return base;
  }

  function createChainedCommand(command) {
    return function(...args) {
      const parent = this.__base;
      debug(
        `adding chained command '${command.name}' from '${parent.command.name}'`
      );
      if (getRootFromBase(parent) !== last(holly.__rootCommands)) {
        throw new Error("do not use holly out of context");
      }
      if (command.captureStack) {
        const error = new Error();
        args = [error.stack, ...args];
      }
      const chainBase = {
        parent,
        command,
        args,
        children: []
      };
      parent.children.push(chainBase);
      holly.__commands.push(chainBase);
      return createNewBase(chainBase);
    };
  }

  chainedCommands.forEach(command => {
    chainedCommandsBase[command.name] = createChainedCommand(command);
  });

  function createInitialCommand(command) {
    return (...args) => {
      debug(`adding root command '${command.name}'`);
      if (command.captureStack) {
        const error = new Error();
        args = [error.stack, ...args];
      }
      const chainBase = {
        command,
        args,
        children: []
      };
      holly.__rootCommands.push(chainBase);
      holly.__commands.push(chainBase);
      return createNewBase(chainBase);
    };
  }

  rootCommands.forEach(command => {
    holly[command.name] = createInitialCommand(command);
  });

  async function runCommand(commandInstance) {
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
    const commands = holly.__commands;
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      await runCommand(command);
    }
  };

  return holly;
};
