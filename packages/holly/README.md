[![Build Status](https://travis-ci.org/HollyAutomation/Holly.svg?branch=master)](https://travis-ci.org/HollyAutomation/Holly) [![codecov](https://codecov.io/gh/HollyAutomation/Holly/branch/master/graph/badge.svg)](https://codecov.io/gh/HollyAutomation/Holly)

## Holly

A reliable and simple automated testing framework built around playwright and mocha with Jest matchers and snapshots thrown in, running in parallel with a time-travel capable UI.

## Current Status - POC

This project is in POC state. Anything could change or it could be abandoned.

## Features

- Retry tests - individual tests can retry
- Retry assertions - tests will wait for assertions to pass
- Inline snapshots - Jest style toMatchInlineSnapshot, built for Automation
- Parallel suites - Suites can run in parallel
- Easy, simple API - the api provides helpers to enable writing short tests
- Escape Hatches - able to access the more advanced playwright API if needed
- Extensible - Plugins allow extending commands.
- Multiple Reporters - Supported out of the box (unlike Mocha)

## Example

```javascript
const { newPage, $ } = holly;
describe("Integration", () => {
  beforeEach(async () => {
    await newPage("http://www.google.com");
  });

  it("works", async () => {
    await $("input[type=text]").type("hello");
    await $("input[type=text]")
      .value()
      .shouldMatchInlineSnapshot(`'hello'`);
  });
});
```

## Async vs Sync

Holly can be used in a synchronous way (no `async` or `await`'s needed) if that is what you prefer.

Example:

```javascript
const { newPage, $ } = holly;
describe("Integration", () => {
  beforeEach(() => {
    newPage("http://www.google.com");
  });

  it("works synchronously", () => {
    $("input[type=text]").type("hello");
    $("input[type=text]")
      .value()
      .shouldMatchInlineSnapshot(`'hello'`);
  });
});
```

However it has two downsides:

- Debugging a test is more difficult as you cannot step through the commands in your own source code (because commands are recorded and then played back, separate from your source)
- If you need to access the playwright API (which we recommend anyplace where holly hasn't made it easier or provided an alternative), you will need to use `async` and `await` as its a promise based API so you may find yourself having inconsistent tests.

## Design Decisions

- the "Magic" nature of the api regarding how a sync call can be executed async - this is because of the retry mechanism - its important that assertions can retry, but if the assertion moves inside the promise (so for instance using Playwrights waitFor) then it makes it difficult to use more advanced expectations or things like inline snapshots.

## Reason for the name

Holly is typically portrayed as green and red and the aim of this test runner is to provide automation tests that are green or red but never flakey or unknown yellow.
