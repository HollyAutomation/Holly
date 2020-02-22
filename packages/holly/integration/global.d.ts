import {
  ClickOptions,
  Button,
  MultiClickOptions,
  PointerActionOptions
} from "playwright-core/lib/input";
import { Viewport } from "playwright-core/lib/types";

type AssymmetricMatcher = {};

type PageKeyboardCommands = {
  keydown: (
    key: string,
    options?: {
      text?: string;
    }
  ) => HollyChainPageAwaitable;
  keyup: (key: string) => HollyChainPageAwaitable;
  sendCharacters: (text: string) => HollyChainPageAwaitable;
  type: (
    text: string,
    options?: {
      delay?: number;
    }
  ) => HollyChainPageAwaitable;
  keypress: (
    key: string,
    options?: {
      delay?: number;
      text?: string;
    }
  ) => HollyChainPageAwaitable;
};

type ElementKeyboardCommands = {
  type: (
    text: string,
    options?: {
      delay?: number;
    }
  ) => HollyChainElementAwaitable;
  keypress: (
    key: string,
    options?: {
      delay?: number;
      text?: string;
    }
  ) => HollyChainElementAwaitable;
};

type PageMouseCommands = {
  click: (
    x: number,
    y: number,
    options?: ClickOptions
  ) => HollyChainPageAwaitable;
  dblclick: (
    x: number,
    y: number,
    options?: MultiClickOptions
  ) => HollyChainPageAwaitable;
  mousedown: (options?: {
    button?: Button;
    clickCount?: number;
  }) => HollyChainPageAwaitable;
  mousemove: (
    x: number,
    y: number,
    options?: {
      steps?: number;
    }
  ) => HollyChainPageAwaitable;
  tripleclick: (
    x: number,
    y: number,
    options?: MultiClickOptions
  ) => HollyChainPageAwaitable;
  mouseup: (options?: {
    button?: Button;
    clickCount?: number;
  }) => HollyChainPageAwaitable;
};

type ElementMouseCommands = {
  click: (options?: ClickOptions) => HollyChainElementAwaitable;
  dblclick: (options?: MultiClickOptions) => HollyChainElementAwaitable;
  tripleclick: (options?: MultiClickOptions) => HollyChainElementAwaitable;
};

type MiscPageCommands = {
  setViewportSize: (viewport: Viewport) => HollyChainPageAwaitable;
  screenshot: (name?: string) => HollyChainPageAwaitable;
  $: (selector: string) => HollyChainElementAwaitable;
  byText: (text: string) => HollyChainElementAwaitable;
};

type MiscElementCommands = {
  focus: () => HollyChainElementAwaitable;
  hover: (options?: PointerActionOptions) => HollyChainElementAwaitable;
  scrollIntoViewIfNeeded: () => HollyChainElementAwaitable;
  screenshot: (name?: string) => HollyChainElementAwaitable;
};

type EscapeHatchCommands = {
  pipe: (fn: () => any) => HollyChainValueAwaitable;
  evaluate: (fn: () => any) => HollyChainValueAwaitable;
};

type Holly = {
  newPage: (url: string, viewport?: Viewport) => HollyChainPageAwaitable;

  wrap: (value: any) => HollyChainValueAwaitable;

  // TODO add the rest of the matchers
  any: (anyType: any) => AssymmetricMatcher;
} & PageMouseCommands &
  PageKeyboardCommands &
  MiscPageCommands &
  EscapeHatchCommands;

type HollyChainPage = {
  and: HollyChainPageAwaitable;
} & PageMouseCommands &
  PageKeyboardCommands &
  MiscPageCommands &
  EscapeHatchCommands;

type HollyChainPageAwaitable = HollyChainPage & Promise<void>;

type HollyChainElement = {
  value: () => HollyChainValueAwaitable;
  text: () => HollyChainValueAwaitable;
  textArray: () => HollyChainValueAwaitable;

  type: (value: string) => HollyChainElementAwaitable;

  and: HollyChainElementAwaitable;
} & ElementMouseCommands &
  ElementKeyboardCommands &
  EscapeHatchCommands &
  MiscElementCommands;

type HollyChainElementAwaitable = HollyChainElement & Promise<void>;

type HollyChainValue = {
  shouldMatchInlineSnapshot: (snapshot?: string) => HollyChainValueAwaitable;
  shouldEqual: (expected: any) => HollyChainValueAwaitable;
  shouldNotEqual: (expected: any) => HollyChainValueAwaitable;
  shouldMatch: (expected: any) => HollyChainValueAwaitable;
  shouldNotMatch: (expected: any) => HollyChainValueAwaitable;
  shouldBeDefined: () => HollyChainValueAwaitable;
  shouldNotBeDefined: () => HollyChainValueAwaitable;
  shouldBeUndefined: () => HollyChainValueAwaitable;
  shouldNotBeUndefined: () => HollyChainValueAwaitable;
  shouldBeNull: () => HollyChainValueAwaitable;
  shouldNotBeNull: () => HollyChainValueAwaitable;
  shouldBeCloseTo: (
    expected: number,
    precision?: number
  ) => HollyChainValueAwaitable;
  shouldNotBeCloseTo: (
    expected: number,
    precision?: number
  ) => HollyChainValueAwaitable;
  shouldBeFalsy: () => HollyChainValueAwaitable;
  shouldNotBeFalsy: () => HollyChainValueAwaitable;
  shouldBeTruthy: () => HollyChainValueAwaitable;
  shouldNotBeTruthy: () => HollyChainValueAwaitable;
  shouldBeGreaterThan: (expected: number) => HollyChainValueAwaitable;
  shouldNotBeGreaterThan: (expected: number) => HollyChainValueAwaitable;
  shouldBeGreaterThanOrEqual: (expected: number) => HollyChainValueAwaitable;
  shouldNotBeGreaterThanOrEqual: (expected: number) => HollyChainValueAwaitable;
  shouldBeLessThan: (expected: number) => HollyChainValueAwaitable;
  shouldNotBeLessThan: (expected: number) => HollyChainValueAwaitable;
  shouldBeLessThanOrEqual: (expected: number) => HollyChainValueAwaitable;
  shouldNotBeLessThanOrEqual: (expected: number) => HollyChainValueAwaitable;
  shouldContain: (expected: any) => HollyChainValueAwaitable;
  shouldNotContain: (expected: any) => HollyChainValueAwaitable;
  shouldContainEqual: (expected: any) => HollyChainValueAwaitable;
  shouldNotContainEqual: (expected: any) => HollyChainValueAwaitable;
  shouldHaveLength: (length: number) => HollyChainValueAwaitable;
  shouldNotHaveLength: (length: number) => HollyChainValueAwaitable;
  shouldHaveProperty: (
    path: string | ReadonlyArray<string>,
    value?: any
  ) => HollyChainValueAwaitable;
  shouldNotHaveProperty: (
    path: string | ReadonlyArray<string>,
    value?: any
  ) => HollyChainValueAwaitable;
  shouldMatchObject: (expected: Object) => HollyChainValueAwaitable;
  shouldNotMatchObject: (expected: Object) => HollyChainValueAwaitable;
  and: HollyChainValueAwaitable;
} & EscapeHatchCommands;

type HollyChainValueAwaitable = HollyChainValue & Promise<void>;

declare global {
  const holly: Holly;
}
