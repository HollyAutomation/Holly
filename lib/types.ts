import { BrowserContext, Page } from "playwright-core";

export type Holly = {
  __executeSoFar: () => Promise<void>;
  __start: (context: BrowserContext) => void;
  __page: Page | null | void;
  __context: BrowserContext;
  __commands: Array<CommandInstance>;
  __rootCommands: Array<CommandInstance>;
  type: () => HollyChainAwaitable;
};

export type HollyChain = {
  value: () => HollyChainAwaitable;
  shouldMatchInlineSnapshot: () => HollyChainAwaitable;
  __currentCommandInstance: CommandInstance;
};

export type HollyChainAwaitable = Promise<HollyChain> & HollyChain;

export type CommandInstance = {
  parent?: CommandInstance;
  children: Array<CommandInstance>;
  result?: any;
  command: CommandDefinition;
  args: ReadonlyArray<any>;
  retry?: null | (() => any);
};

export type CommandDefinition = {
  name: string;
  run: (...args: Array<any>) => any;
  canRetry?: boolean;
  captureStack?: boolean;
};
