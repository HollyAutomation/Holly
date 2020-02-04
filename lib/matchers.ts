/* This file is a modified version of the jest original matchers:
 * https://github.com/facebook/jest/blob/v25.1.0/packages/expect/src/matchers.ts
 * So the file is under the folowing copyright:
 */
/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found here:
 * MIT License
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

import getType = require("jest-get-type");
import {
  DIM_COLOR,
  EXPECTED_COLOR,
  MatcherHintOptions,
  RECEIVED_COLOR,
  SUGGEST_TO_CONTAIN_EQUAL,
  ensureExpectedIsNonNegativeInteger,
  ensureNoExpected,
  ensureNumbers,
  getLabelPrinter,
  matcherErrorMessage,
  matcherHint,
  printDiffOrStringify,
  printExpected,
  printReceived,
  printWithType,
  stringify
} from "jest-matcher-utils";
import { MatcherState, MatchersObject } from "./types";
import {
  printCloseTo,
  printReceivedArrayContainExpectedItem,
  printReceivedStringContainExpectedResult,
  printReceivedStringContainExpectedSubstring
} from "expect/build/print";
import {
  getObjectSubset,
  getPath,
  iterableEquality,
  subsetEquality
} from "expect/build/utils";
import { equals } from "expect/build/jasmineUtils";

// Omit colon and one or more spaces, so can call getLabelPrinter.
const EXPECTED_LABEL = "Expected";
const RECEIVED_LABEL = "Received";
const EXPECTED_VALUE_LABEL = "Expected value";
const RECEIVED_VALUE_LABEL = "Received value";

type ContainIterable =
  | Array<unknown>
  | Set<unknown>
  | NodeListOf<any>
  | DOMTokenList
  | HTMLCollectionOf<any>;

const matchers: MatchersObject = {
  toBeCloseTo(
    this: MatcherState,
    matcherName: string,
    received: number,
    expected: number,
    precision: number = 2
  ) {
    const secondArgument = arguments.length === 3 ? "precision" : undefined;
    const isNot = this.isNot;
    const options: MatcherHintOptions = {
      // isNot, - used to add '.not' to the matcher hint
      secondArgument,
      secondArgumentColor: (arg: string) => arg
    };

    if (typeof expected !== "number") {
      throw new Error(
        matcherErrorMessage(
          matcherHint(matcherName, undefined, undefined, options),
          `${EXPECTED_COLOR("expected")} value must be a number`,
          printWithType("Expected", expected, printExpected)
        )
      );
    }

    if (typeof received !== "number") {
      throw new Error(
        matcherErrorMessage(
          matcherHint(matcherName, undefined, undefined, options),
          `${RECEIVED_COLOR("received")} value must be a number`,
          printWithType("Received", received, printReceived)
        )
      );
    }

    let pass = false;
    let expectedDiff = 0;
    let receivedDiff = 0;

    if (received === Infinity && expected === Infinity) {
      pass = true; // Infinity - Infinity is NaN
    } else if (received === -Infinity && expected === -Infinity) {
      pass = true; // -Infinity - -Infinity is NaN
    } else {
      expectedDiff = Math.pow(10, -precision) / 2;
      receivedDiff = Math.abs(expected - received);
      pass = receivedDiff < expectedDiff;
    }

    const message = pass
      ? () =>
          matcherHint(matcherName, undefined, undefined, options) +
          "\n\n" +
          `Expected: not ${printExpected(expected)}\n` +
          (receivedDiff === 0
            ? ""
            : `Received:     ${printReceived(received)}\n` +
              "\n" +
              printCloseTo(receivedDiff, expectedDiff, precision, isNot))
      : () =>
          matcherHint(matcherName, undefined, undefined, options) +
          "\n\n" +
          `Expected: ${printExpected(expected)}\n` +
          `Received: ${printReceived(received)}\n` +
          "\n" +
          printCloseTo(receivedDiff, expectedDiff, precision, isNot);

    return { message, pass };
  },

  toBeDefined(
    this: MatcherState,
    matcherName: string,
    received: unknown,
    expected: void
  ) {
    const options: MatcherHintOptions = {
            // isNot: this.isNot, - used to add '.not' to the matcher hint
    };
    ensureNoExpected(expected, matcherName, options);

    const pass = received !== void 0;

    const message = () =>
      matcherHint(matcherName, undefined, "", options) +
      "\n\n" +
      `Received: ${printReceived(received)}`;

    return { message, pass };
  },

  toBeFalsy(
    this: MatcherState,
    matcherName: string,
    received: unknown,
    expected: void
  ) {
    const options: MatcherHintOptions = {
            // isNot: this.isNot, - used to add '.not' to the matcher hint
    };
    ensureNoExpected(expected, matcherName, options);

    const pass = !received;

    const message = () =>
      matcherHint(matcherName, undefined, "", options) +
      "\n\n" +
      `Received: ${printReceived(received)}`;

    return { message, pass };
  },

  toBeGreaterThan(
    this: MatcherState,
    matcherName: string,
    received: number | bigint,
    expected: number | bigint
  ) {
    const isNot = this.isNot;
    const options: MatcherHintOptions = {
      isNot
    };
    ensureNumbers(received, expected, matcherName, options);

    const pass = received > expected;

    const message = () =>
      matcherHint(matcherName, undefined, undefined, options) +
      "\n\n" +
      `Expected:${isNot ? " not" : ""} > ${printExpected(expected)}\n` +
      `Received:${isNot ? "    " : ""}   ${printReceived(received)}`;

    return { message, pass };
  },

  toBeGreaterThanOrEqual(
    this: MatcherState,
    matcherName: string,
    received: number | bigint,
    expected: number | bigint
  ) {
    const isNot = this.isNot;
    const options: MatcherHintOptions = {
      isNot
    };
    ensureNumbers(received, expected, matcherName, options);

    const pass = received >= expected;

    const message = () =>
      matcherHint(matcherName, undefined, undefined, options) +
      "\n\n" +
      `Expected:${isNot ? " not" : ""} >= ${printExpected(expected)}\n` +
      `Received:${isNot ? "    " : ""}    ${printReceived(received)}`;

    return { message, pass };
  },

  toBeLessThan(
    this: MatcherState,
    matcherName: string,
    received: number | bigint,
    expected: number | bigint
  ) {
    const isNot = this.isNot;
    const options: MatcherHintOptions = {
      isNot
    };
    ensureNumbers(received, expected, matcherName, options);

    const pass = received < expected;

    const message = () =>
      matcherHint(matcherName, undefined, undefined, options) +
      "\n\n" +
      `Expected:${isNot ? " not" : ""} < ${printExpected(expected)}\n` +
      `Received:${isNot ? "    " : ""}   ${printReceived(received)}`;

    return { message, pass };
  },

  toBeLessThanOrEqual(
    this: MatcherState,
    matcherName: string,
    received: number | bigint,
    expected: number | bigint
  ) {
    const isNot = this.isNot;
    const options: MatcherHintOptions = {
      isNot
    };
    ensureNumbers(received, expected, matcherName, options);

    const pass = received <= expected;

    const message = () =>
      matcherHint(matcherName, undefined, undefined, options) +
      "\n\n" +
      `Expected:${isNot ? " not" : ""} <= ${printExpected(expected)}\n` +
      `Received:${isNot ? "    " : ""}    ${printReceived(received)}`;

    return { message, pass };
  },

  toBeNull(
    this: MatcherState,
    matcherName: string,
    received: unknown,
    expected: void
  ) {
    const options: MatcherHintOptions = {
            // isNot: this.isNot, - used to add '.not' to the matcher hint
    };
    ensureNoExpected(expected, matcherName, options);

    const pass = received === null;

    const message = () =>
      matcherHint(matcherName, undefined, "", options) +
      "\n\n" +
      `Received: ${printReceived(received)}`;

    return { message, pass };
  },

  toBeTruthy(
    this: MatcherState,
    matcherName: string,
    received: unknown,
    expected: void
  ) {
    const options: MatcherHintOptions = {
            // isNot: this.isNot, - used to add '.not' to the matcher hint
    };
    ensureNoExpected(expected, matcherName, options);

    const pass = !!received;

    const message = () =>
      matcherHint(matcherName, undefined, "", options) +
      "\n\n" +
      `Received: ${printReceived(received)}`;

    return { message, pass };
  },

  toBeUndefined(
    this: MatcherState,
    matcherName: string,
    received: unknown,
    expected: void
  ) {
    const options: MatcherHintOptions = {
            // isNot: this.isNot, - used to add '.not' to the matcher hint
    };
    ensureNoExpected(expected, matcherName, options);

    const pass = received === void 0;

    const message = () =>
      matcherHint(matcherName, undefined, "", options) +
      "\n\n" +
      `Received: ${printReceived(received)}`;

    return { message, pass };
  },

  toContain(
    this: MatcherState,
    matcherName: string,
    received: ContainIterable | string,
    expected: unknown
  ) {
    const isNot = this.isNot;
    const options: MatcherHintOptions = {
      comment: "indexOf",
      isNot
    };

    if (received == null) {
      throw new Error(
        matcherErrorMessage(
          matcherHint(matcherName, undefined, undefined, options),
          `${RECEIVED_COLOR("received")} value must not be null nor undefined`,
          printWithType("Received", received, printReceived)
        )
      );
    }

    if (typeof received === "string") {
      const index = received.indexOf(String(expected));
      const pass = index !== -1;

      const message = () => {
        const labelExpected = `Expected ${
          typeof expected === "string" ? "substring" : "value"
        }`;
        const labelReceived = "Received string";
        const printLabel = getLabelPrinter(labelExpected, labelReceived);

        return (
          matcherHint(matcherName, undefined, undefined, options) +
          "\n\n" +
          `${printLabel(labelExpected)}${isNot ? "not " : ""}${printExpected(
            expected
          )}\n` +
          `${printLabel(labelReceived)}${isNot ? "    " : ""}${
            isNot
              ? printReceivedStringContainExpectedSubstring(
                  received,
                  index,
                  String(expected).length
                )
              : printReceived(received)
          }`
        );
      };

      return { message, pass };
    }

    const indexable = Array.from(received);
    const index = indexable.indexOf(expected);
    const pass = index !== -1;

    const message = () => {
      const labelExpected = "Expected value";
      const labelReceived = `Received ${getType(received)}`;
      const printLabel = getLabelPrinter(labelExpected, labelReceived);

      return (
        matcherHint(matcherName, undefined, undefined, options) +
        "\n\n" +
        `${printLabel(labelExpected)}${isNot ? "not " : ""}${printExpected(
          expected
        )}\n` +
        `${printLabel(labelReceived)}${isNot ? "    " : ""}${
          isNot && Array.isArray(received)
            ? printReceivedArrayContainExpectedItem(received, index)
            : printReceived(received)
        }` +
        (!isNot &&
        indexable.findIndex(item =>
          equals(item, expected, [iterableEquality])
        ) !== -1
          ? `\n\n${SUGGEST_TO_CONTAIN_EQUAL}`
          : "")
      );
    };

    return { message, pass };
  },

  toContainEqual(
    this: MatcherState,

    matcherName: string,
    received: ContainIterable,
    expected: unknown
  ) {
    const isNot = this.isNot;
    const options: MatcherHintOptions = {
      comment: "deep equality",
      isNot
    };

    if (received == null) {
      throw new Error(
        matcherErrorMessage(
          matcherHint(matcherName, undefined, undefined, options),
          `${RECEIVED_COLOR("received")} value must not be null nor undefined`,
          printWithType("Received", received, printReceived)
        )
      );
    }

    const index = Array.from(received).findIndex(item =>
      equals(item, expected, [iterableEquality])
    );
    const pass = index !== -1;

    const message = () => {
      const labelExpected = "Expected value";
      const labelReceived = `Received ${getType(received)}`;
      const printLabel = getLabelPrinter(labelExpected, labelReceived);

      return (
        matcherHint(matcherName, undefined, undefined, options) +
        "\n\n" +
        `${printLabel(labelExpected)}${isNot ? "not " : ""}${printExpected(
          expected
        )}\n` +
        `${printLabel(labelReceived)}${isNot ? "    " : ""}${
          isNot && Array.isArray(received)
            ? printReceivedArrayContainExpectedItem(received, index)
            : printReceived(received)
        }`
      );
    };

    return { message, pass };
  },

  toEqual(
    this: MatcherState,
    matcherName: string,
    received: unknown,
    expected: unknown
  ) {
    const options: MatcherHintOptions = {
      comment: "deep equality",
            // isNot: this.isNot, - used to add '.not' to the matcher hint
    };

    const pass = equals(received, expected, [iterableEquality]);

    const message = pass
      ? () =>
          matcherHint(matcherName, undefined, undefined, options) +
          "\n\n" +
          `Expected: not ${printExpected(expected)}\n` +
          (stringify(expected) !== stringify(received)
            ? `Received:     ${printReceived(received)}`
            : "")
      : () =>
          matcherHint(matcherName, undefined, undefined, options) +
          "\n\n" +
          printDiffOrStringify(
            expected,
            received,
            EXPECTED_LABEL,
            RECEIVED_LABEL,
            this.expand
          );

    // Passing the actual and expected objects so that a custom reporter
    // could access them, for example in order to display a custom visual diff,
    // or create a different error message
    return { actual: received, expected, message, name: matcherName, pass };
  },

  toHaveLength(
    this: MatcherState,
    matcherName: string,
    received: any,
    expected: number
  ) {
    const isNot = this.isNot;
    const options: MatcherHintOptions = {
      isNot
    };

    if (
      typeof received !== "string" &&
      (!received || typeof received.length !== "number")
    ) {
      throw new Error(
        matcherErrorMessage(
          matcherHint(matcherName, undefined, undefined, options),
          `${RECEIVED_COLOR(
            "received"
          )} value must have a length property whose value must be a number`,
          printWithType("Received", received, printReceived)
        )
      );
    }

    ensureExpectedIsNonNegativeInteger(expected, matcherName, options);

    const pass = received.length === expected;

    const message = () => {
      const labelExpected = "Expected length";
      const labelReceivedLength = "Received length";
      const labelReceivedValue = `Received ${getType(received)}`;
      const printLabel = getLabelPrinter(
        labelExpected,
        labelReceivedLength,
        labelReceivedValue
      );

      return (
        matcherHint(matcherName, undefined, undefined, options) +
        "\n\n" +
        `${printLabel(labelExpected)}${isNot ? "not " : ""}${printExpected(
          expected
        )}\n` +
        (isNot
          ? ""
          : `${printLabel(labelReceivedLength)}${printReceived(
              received.length
            )}\n`) +
        `${printLabel(labelReceivedValue)}${isNot ? "    " : ""}${printReceived(
          received
        )}`
      );
    };

    return { message, pass };
  },

  toHaveProperty(
    this: MatcherState,
    matcherName: string,
    received: object,
    expectedPath: string | Array<string>,
    expectedValue?: unknown
  ) {
    const expectedArgument = "path";
    const hasValue = arguments.length === 3;
    const options: MatcherHintOptions = {
            // isNot: this.isNot, - used to add '.not' to the matcher hint
      secondArgument: hasValue ? "value" : ""
    };

    if (received === null || received === undefined) {
      throw new Error(
        matcherErrorMessage(
          matcherHint(matcherName, undefined, expectedArgument, options),
          `${RECEIVED_COLOR("received")} value must not be null nor undefined`,
          printWithType("Received", received, printReceived)
        )
      );
    }

    const expectedPathType = getType(expectedPath);

    if (expectedPathType !== "string" && expectedPathType !== "array") {
      throw new Error(
        matcherErrorMessage(
          matcherHint(matcherName, undefined, expectedArgument, options),
          `${EXPECTED_COLOR("expected")} path must be a string or array`,
          printWithType("Expected", expectedPath, printExpected)
        )
      );
    }

    const expectedPathLength =
      typeof expectedPath === "string"
        ? expectedPath.split(".").length
        : expectedPath.length;

    if (expectedPathType === "array" && expectedPathLength === 0) {
      throw new Error(
        matcherErrorMessage(
          matcherHint(matcherName, undefined, expectedArgument, options),
          `${EXPECTED_COLOR("expected")} path must not be an empty array`,
          printWithType("Expected", expectedPath, printExpected)
        )
      );
    }

    const result = getPath(received, expectedPath);
    const { lastTraversedObject, hasEndProp } = result;
    const receivedPath = result.traversedPath;
    const hasCompletePath = receivedPath.length === expectedPathLength;
    const receivedValue = hasCompletePath ? result.value : lastTraversedObject;

    const pass = hasValue
      ? equals(result.value, expectedValue, [iterableEquality])
      : Boolean(hasEndProp); // theoretically undefined if empty path
    // Remove type cast if we rewrite getPath as iterative algorithm.

    // Delete this unique report if future breaking change
    // removes the edge case that expected value undefined
    // also matches absence of a property with the key path.
    if (pass && !hasCompletePath) {
      const message = () =>
        matcherHint(matcherName, undefined, expectedArgument, options) +
        "\n\n" +
        `Expected path: ${printExpected(expectedPath)}\n` +
        `Received path: ${printReceived(
          expectedPathType === "array" || receivedPath.length === 0
            ? receivedPath
            : receivedPath.join(".")
        )}\n\n` +
        `Expected value: not ${printExpected(expectedValue)}\n` +
        `Received value:     ${printReceived(receivedValue)}\n\n` +
        DIM_COLOR(
          "Because a positive assertion passes for expected value undefined if the property does not exist, this negative assertion fails unless the property does exist and has a defined value"
        );

      return { message, pass };
    }

    const message = pass
      ? () =>
          matcherHint(matcherName, undefined, expectedArgument, options) +
          "\n\n" +
          (hasValue
            ? `Expected path: ${printExpected(expectedPath)}\n\n` +
              `Expected value: not ${printExpected(expectedValue)}` +
              (stringify(expectedValue) !== stringify(receivedValue)
                ? `\nReceived value:     ${printReceived(receivedValue)}`
                : "")
            : `Expected path: not ${printExpected(expectedPath)}\n\n` +
              `Received value: ${printReceived(receivedValue)}`)
      : () =>
          matcherHint(matcherName, undefined, expectedArgument, options) +
          "\n\n" +
          `Expected path: ${printExpected(expectedPath)}\n` +
          (hasCompletePath
            ? "\n" +
              printDiffOrStringify(
                expectedValue,
                receivedValue,
                EXPECTED_VALUE_LABEL,
                RECEIVED_VALUE_LABEL,
                this.expand
              )
            : `Received path: ${printReceived(
                expectedPathType === "array" || receivedPath.length === 0
                  ? receivedPath
                  : receivedPath.join(".")
              )}\n\n` +
              (hasValue
                ? `Expected value: ${printExpected(expectedValue)}\n`
                : "") +
              `Received value: ${printReceived(receivedValue)}`);

    return { message, pass };
  },

  toMatch(
    this: MatcherState,
    matcherName: string,
    received: string,
    expected: string | RegExp
  ) {
    const options: MatcherHintOptions = {
            // isNot: this.isNot, - used to add '.not' to the matcher hint
    };

    if (typeof received !== "string") {
      throw new Error(
        matcherErrorMessage(
          matcherHint(matcherName, undefined, undefined, options),
          `${RECEIVED_COLOR("received")} value must be a string`,
          printWithType("Received", received, printReceived)
        )
      );
    }

    if (
      !(typeof expected === "string") &&
      !(expected && typeof expected.test === "function")
    ) {
      throw new Error(
        matcherErrorMessage(
          matcherHint(matcherName, undefined, undefined, options),
          `${EXPECTED_COLOR(
            "expected"
          )} value must be a string or regular expression`,
          printWithType("Expected", expected, printExpected)
        )
      );
    }

    const pass =
      typeof expected === "string"
        ? received.includes(expected)
        : new RegExp(expected).test(received);

    const message = pass
      ? () =>
          typeof expected === "string"
            ? matcherHint(matcherName, undefined, undefined, options) +
              "\n\n" +
              `Expected substring: not ${printExpected(expected)}\n` +
              `Received string:        ${printReceivedStringContainExpectedSubstring(
                received,
                received.indexOf(expected),
                expected.length
              )}`
            : matcherHint(matcherName, undefined, undefined, options) +
              "\n\n" +
              `Expected pattern: not ${printExpected(expected)}\n` +
              `Received string:      ${printReceivedStringContainExpectedResult(
                received,
                typeof expected.exec === "function"
                  ? expected.exec(received)
                  : null
              )}`
      : () => {
          const labelExpected = `Expected ${
            typeof expected === "string" ? "substring" : "pattern"
          }`;
          const labelReceived = "Received string";
          const printLabel = getLabelPrinter(labelExpected, labelReceived);

          return (
            matcherHint(matcherName, undefined, undefined, options) +
            "\n\n" +
            `${printLabel(labelExpected)}${printExpected(expected)}\n` +
            `${printLabel(labelReceived)}${printReceived(received)}`
          );
        };

    return { message, pass };
  },

  toMatchObject(
    this: MatcherState,
    matcherName: string,
    received: object,
    expected: object
  ) {
    const options: MatcherHintOptions = {
            // isNot: this.isNot, - used to add '.not' to the matcher hint
    };

    if (typeof received !== "object" || received === null) {
      throw new Error(
        matcherErrorMessage(
          matcherHint(matcherName, undefined, undefined, options),
          `${RECEIVED_COLOR("received")} value must be a non-null object`,
          printWithType("Received", received, printReceived)
        )
      );
    }

    if (typeof expected !== "object" || expected === null) {
      throw new Error(
        matcherErrorMessage(
          matcherHint(matcherName, undefined, undefined, options),
          `${EXPECTED_COLOR("expected")} value must be a non-null object`,
          printWithType("Expected", expected, printExpected)
        )
      );
    }

    const pass = equals(received, expected, [iterableEquality, subsetEquality]);

    const message = pass
      ? () =>
          matcherHint(matcherName, undefined, undefined, options) +
          "\n\n" +
          `Expected: not ${printExpected(expected)}` +
          (stringify(expected) !== stringify(received)
            ? `\nReceived:     ${printReceived(received)}`
            : "")
      : () =>
          matcherHint(matcherName, undefined, undefined, options) +
          "\n\n" +
          printDiffOrStringify(
            expected,
            getObjectSubset(received, expected),
            EXPECTED_LABEL,
            RECEIVED_LABEL,
            this.expand
          );

    return { message, pass };
  }
};

export default matchers;
