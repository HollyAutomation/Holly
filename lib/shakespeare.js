//const playwright = require("playwright");
const debug = require("debug")("shakespeare:shakespeare");

const rootCommands = [
  {
    name: "get",
    run(shakespeare, selector) {}
  },
  {
    name: "visit",
    run(shakespeare, url) {}
  }
];
const chainedCommands = [
  {
    name: "value",
    run(shakespeare, element) {}
  },
  {
    name: "shouldEqual",
    run(shakespeare, x) {}
  },
  {
    name: "type",
    run(shakespeare, x) {}
  }
];

const retryDelay = () => new Promise(resolve => setTimeout(resolve, 50));

async function runCommand(commandInstance) {
  debug(`Running command ${commandInstance.command.name}`);
  let args = commandInstance.args;
  if (commandInstance.parent) {
    args = [commandInstance.parent.result, ...args];
  }
  try {
    const result = await commandInstance.command.run(...args);
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
      debug(`exception so retring ${commandInstance.command.name}`);
      await retryDelay();
      await commandInstance.parent.retry();
      return runCommand(commandInstance);
    }
  }
}

function last(ar) {
  return ar[ar.length - 1];
}

module.exports = function createShakespeare() {
  const shakespeare = {
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
      if (getRootFromBase(parent) !== last(shakespeare.__rootCommands)) {
        throw new Error("do not use shakespeare out of context");
      }
      const chainBase = {
        parent,
        command,
        args,
        children: []
      };
      parent.children.push(chainBase);
      shakespeare.__commands.push(chainBase);
      return createNewBase(chainBase);
    };
  }

  chainedCommands.forEach(command => {
    chainedCommandsBase[command.name] = createChainedCommand(command);
  });

  function createInitialCommand(command) {
    return (...args) => {
      debug(`adding root command '${command.name}'`);

      const chainBase = {
        command,
        args,
        children: []
      };
      shakespeare.__rootCommands.push(chainBase);
      shakespeare.__commands.push(chainBase);
      return createNewBase(chainBase);
    };
  }

  rootCommands.forEach(command => {
    shakespeare[command.name] = createInitialCommand(command);
  });

  shakespeare.__start = () => {
    shakespeare.__page = null;
    shakespeare.__rootCommands = [];
    shakespeare.__commands = [];
  };
  shakespeare.__executeSoFar = async () => {
    const commands = shakespeare.__commands;
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      runCommand(command);
    }
  };

  return shakespeare;
};
