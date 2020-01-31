export {};

type AssymmetricMatcher = {};

type Holly = {
  newPage: (url: string) => HollyChainAwaitable;
  $: (selector: string) => HollyChainAwaitable;
  any: (anyType: any) => AssymmetricMatcher;
};

type HollyChain = {
  value: () => HollyChainAwaitable;
  type: (value: string) => HollyChainAwaitable;
  shouldMatchInlineSnapshot: (snapshot?: string) => HollyChainAwaitable;
  shouldNotEqual: (expected: any) => HollyChainAwaitable;
  shouldEqual: (expected: any) => HollyChainAwaitable;
  shouldMatch: (expected: any) => HollyChainAwaitable;
};

type HollyChainAwaitable = Promise<HollyChain> & HollyChain;

type HollyRunnable = (this: MochaContext, holly: Holly) => Promise<any> | void;

type MochaContext = {
  retries: (retries: number) => void;
};

declare global {
  function describe(title: string, fn: (this: MochaContext) => void): void;
  function before(
    titleOrFn: HollyRunnable | string,
    maybeFn: HollyRunnable | void
  ): void;
  function after(
    titleOrFn: HollyRunnable | string,
    maybeFn?: HollyRunnable | void
  ): void;
  function beforeEach(
    titleOrFn: HollyRunnable | string,
    maybeFn?: HollyRunnable | void
  ): void;
  function afterEach(
    titleOrFn: HollyRunnable | string,
    maybeFn?: HollyRunnable | void
  ): void;
  function it(
    titleOrFn: HollyRunnable | string,
    maybeFn?: HollyRunnable | void
  ): void;
}
