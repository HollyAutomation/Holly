const debug = require("debug")("shakespeare:shakespeare");

const rootCommands = [
  {
    name: "$",
    run(shakespeare, selector) {
      return shakespeare.__page.$(selector);
    }
  },
  {
    name: "newPage",
    async run(shakespeare, url) {
      const page = await shakespeare.__context.newPage("about:blank");
      shakespeare.__page = page;
      // here would go coverage etc.
      await page.goto(url);
      return page;
    },
    canRetry: false
  }
];
const chainedCommands = [
  {
    name: "value",
    run(shakespeare, element) {
      return element.evaluate(elem => elem.value);
    }
  },
  {
    name: "shouldEqual",
    run(shakespeare, value, expectedValue) {
      if (value !== expectedValue) {
        debug(`shouldEqual not equal '${value}' '${expectedValue}'`);
        throw new Error(`expected '${expectedValue}' but got '${value}'`);
      }
    }
  },
  {
    name: "shouldMatchInlineSnapshot",
    run(shakespeare, value, stack, snapshot) {
      if (!snapshot || value !== expectedValue) {
        // snapshot could need updating
        // StackUtils
        // TODO - removeInternalLines
        const stackLines = stack.split("\n");
      }
      if (value !== expectedValue) {
        debug(`shouldEqual not equal '${value}' '${expectedValue}'`);
        throw new Error(`expected '${expectedValue}' but got '${value}'`);
      }
    },
    captureStack: true
  },
  {
    name: "type",
    run(shakespeare, element, value) {
      return element.type(value);
    },
    canRetry: false
  }
];

const retryDelay = () => new Promise(resolve => setTimeout(resolve, 50));

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
      if (command.captureStack) {
        const error = new Error();
        args = [error.stack, ...args];
      }
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

  async function runCommand(commandInstance) {
    debug(`Running command '${commandInstance.command.name}'`);
    let args = commandInstance.args;
    if (commandInstance.parent) {
      args = [commandInstance.parent.result, ...args];
    }
    try {
      const result = await commandInstance.command.run(shakespeare, ...args);
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

  shakespeare.__start = context => {
    if (shakespeare.__page) {
      shakespeare.__page.close();
      shakespeare.__page = null;
    }
    shakespeare.__context = context;
    shakespeare.__rootCommands = [];
    shakespeare.__commands = [];
  };
  shakespeare.__executeSoFar = async () => {
    const commands = shakespeare.__commands;
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      await runCommand(command);
    }
  };

  return shakespeare;
};
