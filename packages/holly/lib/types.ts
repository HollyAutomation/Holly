import { BrowserContext, Page, ElementHandle } from "playwright";

export type Holly = {
  __executeSoFar: () => Promise<void>;
  __start: (context: BrowserContext, test: Mocha.Test) => void;
  __end: () => Promise<any>;
  __page: Page | null | void;
  __context: BrowserContext;
  __commands: Array<CommandInstance>;
  __rootCommands: Array<CommandInstance>;
  __currentTest: Mocha.Test;
  __currentTestState: { [key: string]: any };
  __afterTestHooks: Array<() => void | Promise<any>>;
};

export type HollyChain = {
  value: () => HollyChainAwaitable;
  shouldMatchInlineSnapshot: () => HollyChainAwaitable;
  __currentCommandInstance: CommandInstance;
  and: HollyChain;
};

export type HollyChainAwaitable = Promise<HollyChain> & HollyChain;

export type CommandInstance = {
  parent?: CommandInstance;
  children: Array<CommandInstance>;
  result?: any;
  command: CommandDefinition;
  stack: string;
  args: ReadonlyArray<any>;
  retry?: null | (() => any);
  retryStartTime?: number;
};

export type CommandData = {
  holly: Holly;
  commandInstance: CommandInstance;
  element?: ElementHandle;
  test: Mocha.Test;
  config: Config;
};

export type CommandDefinition = {
  name: string;
  run: (commandData: CommandData, ...args: Array<any>) => any;
  canRetry?: boolean;
  captureStack?: boolean;
};

export type MatcherState = {
  isNot: boolean;
  expand: boolean;
};

export type ExpectationResult = {
  pass: boolean;
  message: () => string;
};

export type RawMatcherFn = {
  (
    this: MatcherState,
    matcherName: string,
    received: any,
    expected: any,
    options?: any
  ): ExpectationResult;
};

export type MatchersObject = { [id: string]: RawMatcherFn };

export type Config = {
  specs: string;
  reporters?: ReadonlyArray<string>;
  consistentResultsOrdering?: boolean;
  retryDelay?: string | number;
  testTimeout?: string | number;
  maxRetryTime?: string | number;
  coverage?: boolean;
  sourceRoot?: string;
  servedBasePath?: string;
};
