import {
  ClickOptions,
  Button,
  MultiClickOptions
} from "playwright-core/lib/input";
export {};

type AssymmetricMatcher = {};

type PageKeyboardCommands = {
  keydown: (
    key: string,
    options?: {
      text?: string;
    }
  ) => HollyChainAwaitable;
  keyup: (key: string) => HollyChainAwaitable;
  sendCharacters: (text: string) => HollyChainAwaitable;
  type: (
    text: string,
    options?: {
      delay?: number;
    }
  ) => HollyChainAwaitable;
  keypress: (
    key: string,
    options?: {
      delay?: number;
      text?: string;
    }
  ) => HollyChainAwaitable;
};

type ElementKeyboardCommands = {
  type: (
    text: string,
    options?: {
      delay?: number;
    }
  ) => HollyChainAwaitable;
  keypress: (
    key: string,
    options?: {
      delay?: number;
      text?: string;
    }
  ) => HollyChainAwaitable;
};

type PageMouseCommands = {
  click: (x: number, y: number, options?: ClickOptions) => HollyChainAwaitable;
  dblclick: (
    x: number,
    y: number,
    options?: MultiClickOptions
  ) => HollyChainAwaitable;
  mousedown: (options?: {
    button?: Button;
    clickCount?: number;
  }) => HollyChainAwaitable;
  mousemove: (
    x: number,
    y: number,
    options?: {
      steps?: number;
    }
  ) => HollyChainAwaitable;
  tripleclick: (
    x: number,
    y: number,
    options?: MultiClickOptions
  ) => HollyChainAwaitable;
  mouseup: (options?: {
    button?: Button;
    clickCount?: number;
  }) => HollyChainAwaitable;
};

type ElementMouseCommands = {
  click: (options?: ClickOptions) => HollyChainAwaitable;
  dblclick: (options?: MultiClickOptions) => HollyChainAwaitable;
  tripleclick: (options?: MultiClickOptions) => HollyChainAwaitable;
};

type Holly = {
  newPage: (url: string) => HollyChainAwaitable;
  $: (selector: string) => HollyChainAwaitable;
  any: (anyType: any) => AssymmetricMatcher;
  pipe: (fn: () => any) => HollyChainAwaitable;
  evaluate: (fn: () => any) => HollyChainAwaitable;
} & PageMouseCommands &
  PageKeyboardCommands;

type HollyChain = {
  value: () => HollyChainAwaitable;
  text: () => HollyChainAwaitable;
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
  shouldMatchObject: (expected: Object) => HollyChainAwaitable;
  shouldNotMatchObject: (expected: Object) => HollyChainAwaitable;
  and: HollyChainAwaitable;
  pipe: (fn: (anything: any) => any) => HollyChainAwaitable;
  evaluate: (fn: (anything: any) => any) => HollyChainAwaitable;
} & PageMouseCommands &
  ElementMouseCommands &
  PageKeyboardCommands &
  ElementKeyboardCommands;

type HollyChainAwaitable = Promise<HollyChain> & HollyChain;

declare global {
  const holly: Holly;
}
