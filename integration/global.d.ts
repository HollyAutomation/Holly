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
  shouldBeUndefined: () => HollyChainAwaitable;
  shouldNotBeUndefined: () => HollyChainAwaitable;
  shouldBeNull: () => HollyChainAwaitable;
  shouldNotBeNull: () => HollyChainAwaitable;
  shouldBeCloseTo: (
    expected: number,
    precision?: number
  ) => HollyChainAwaitable;
  shouldNotBeCloseTo: (
    expected: number,
    precision?: number
  ) => HollyChainAwaitable;
  shouldBeFalsy: () => HollyChainAwaitable;
  shouldNotBeFalsy: () => HollyChainAwaitable;
  shouldBeTruthy: () => HollyChainAwaitable;
  shouldNotBeTruthy: () => HollyChainAwaitable;
  shouldBeGreaterThan: (expected: number) => HollyChainAwaitable;
  shouldNotBeGreaterThan: (expected: number) => HollyChainAwaitable;
  shouldBeGreaterThanOrEqual: (expected: number) => HollyChainAwaitable;
  shouldNotBeGreaterThanOrEqual: (expected: number) => HollyChainAwaitable;
  shouldBeLessThan: (expected: number) => HollyChainAwaitable;
  shouldNotBeLessThan: (expected: number) => HollyChainAwaitable;
  shouldBeLessThanOrEqual: (expected: number) => HollyChainAwaitable;
  shouldNotBeLessThanOrEqual: (expected: number) => HollyChainAwaitable;
  shouldContain: (expected: any) => HollyChainAwaitable;
  shouldNotContain: (expected: any) => HollyChainAwaitable;
  shouldContainEqual: (expected: any) => HollyChainAwaitable;
  shouldNotContainEqual: (expected: any) => HollyChainAwaitable;
  shouldHaveLength: (length: number) => HollyChainAwaitable;
  shouldNotHaveLength: (length: number) => HollyChainAwaitable;
  shouldHaveProperty: (
    path: string | ReadonlyArray<string>,
    value?: any
  ) => HollyChainAwaitable;
  shouldNotHaveProperty: (
    path: string | ReadonlyArray<string>,
    value?: any
  ) => HollyChainAwaitable;
  and: HollyChainAwaitable;
  pipe: (fn: (anything: any) => any) => HollyChainAwaitable;
  evaluate: (fn: (anything: any) => any) => HollyChainAwaitable;
};

type HollyChainAwaitable = Promise<HollyChain> & HollyChain;

declare global {
  const holly: Holly;
}
