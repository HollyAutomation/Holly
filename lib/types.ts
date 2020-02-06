import { BrowserContext, Page } from "playwright";

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
  and: HollyChain;
};

export type HollyChainAwaitable = Promise<HollyChain> & HollyChain;

export type CommandInstance = {
  parent?: CommandInstance;
  children: Array<CommandInstance>;
  result?: any;
  command: CommandDefinition;
  stack: string | void;
  args: ReadonlyArray<any>;
  retry?: null | (() => any);
  retryStartTime?: number;
};

export type CommandDefinition = {
  name: string;
  run: (...args: Array<any>) => any;
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
};
