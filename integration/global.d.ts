export {};

type AssymmetricMatcher = {};

type Holly = {
  newPage: (url: string) => HollyChainAwaitable;
  $: (selector: string) => HollyChainAwaitable;
  any: (anyType: any) => AssymmetricMatcher;
  pipe: (fn: () => any) => HollyChainAwaitable;
  evaluate: (fn: () => any) => HollyChainAwaitable;
};

type HollyChain = {
  value: () => HollyChainAwaitable;
  type: (value: string) => HollyChainAwaitable;
  shouldMatchInlineSnapshot: (snapshot?: string) => HollyChainAwaitable;
  shouldEqual: (expected: any) => HollyChainAwaitable;
  shouldNotEqual: (expected: any) => HollyChainAwaitable;
  shouldMatch: (expected: any) => HollyChainAwaitable;
  shouldNotMatch: (expected: any) => HollyChainAwaitable;
  shouldBeDefined: () => HollyChainAwaitable;
  shouldNotBeDefined: () => HollyChainAwaitable;
  shouldBeCloseTo: (
    expected: number,
    precision?: number
  ) => HollyChainAwaitable;
  shouldNotBeCloseTo: (
    expected: number,
    precision?: number
  ) => HollyChainAwaitable;
  and: HollyChainAwaitable;
  pipe: (fn: (anything: any) => any) => HollyChainAwaitable;
  evaluate: (fn: (anything: any) => any) => HollyChainAwaitable;
};

type HollyChainAwaitable = Promise<HollyChain> & HollyChain;

declare global {
  const holly: Holly;
}
