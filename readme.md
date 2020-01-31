## Holly

A reliable and simple automated testing framework built around playwright and mocha with Jest matchers and snapshots thrown in, running in parallel with a timetravel capable UI.

## Current Status - POC

This project is in POC state. Anything could change or it could be abandoned.

## Features

Retry tests - individual tests can retry
Retry assertions - tests will wait for assertions to pass
Inline snapshots - Jest style toMatchInlineSnapshot, built for Automation
Parallel suites - Suites can run in parallel
Easy, simple API - the api provides helpers to enable writing short tests
Escape Hatches - able to access the more advanced playwright API if needed
Extensible - Plugins allow extending commands.
Multiple Reporters - Supported out of the box (unlike Mocha)

## TODO for first initial version:

- [x] playwright integration POC
- [x] Retry assertions POC
- [x] toMatchInlineSnapshot POC
- [x] name change - Holly
- [x] Allow use with promises if you want
- [x] parallel tests POC.
- [x] Eslint
- [x] TypeScript
- [x] Assertions - use Jest POC
- [x] Integration tests POC
- [x] Make tests work as typescript
- [x] Fix inline snapshot to work with transformed files
- [x] Test we can wait for client side promises
- [x] Retry tests POC
- [x] add pipe and do
- [x] What to do about types overlapping because I resused it to pass holly? change to getHolly() call? try to make a new vm context so I can have a global with holly in its thats unique per paralllel instance?
- [x] Manage the parallel process for reporters
- [x] Use glob to get the list of specs to run
- [x] add dependabot
- [ ] add cli command
- [ ] Config file
- [ ] Integration tests that test failures
- [ ] Integration tests that test inline snapshot updates
- [ ] move these checkboxes into issues
- [ ] add build
- [ ] UI POC - command viewer
- [ ] UI POC - test control
- [ ] UI POC - snapshots / history
- [ ] Sample build and publishing typings which work?
- [ ] Unit Tests?
- [ ] command first argument - object with various things in? { holly, stack, playwright, element?, receivedValue?, matcherState }?
- [ ] more complete API mirroring playwright
- [ ] support multiple pages
- [ ] support multi browsers
- [ ] Configuration for parallel - different contexts? (link to caching...)
- [ ] Fix inline snapshot
- [ ] snapshot serializers
- [ ] pick up config for use as an external package
- [ ] ability to extend commands
- [ ] Documentation
- [ ] Code coverage collection
- [ ] Different assertion styles
- [ ] Mocking time?
- [ ] wait for finished?
- [ ] lifecycle/cache clearing?
- [ ] response mocking (easy plugin to playwright)

## Example

```
const { newPage, $ } = holly;
describe("Integration", () => {
  beforeEach(async () => {
    await newPage("http://www.google.com");
  })

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

```
const { newPage, $ } = holly;
describe("Integration", () => {
  beforeEach(() => {
    newPage("http://www.google.com");
  })

  it("works synchronously", () => {
    $("input[type=text]").type("hello");
    $("input[type=text]")
      .value()
      .shouldMatchInlineSnapshot(`'hello'`);
  });
});
```

However it has two downsides:

- Debugging a test is more difficult as you cannot step through the commands in your own source code (because commands are recorded and then played back, seperate from your source)
- If you need to access the playwright API (which we recommend anyplace where holly hasn't made it easier or provided an alternative), you will need to use `async` and `await` as its a promise based API so you may find yourself having inconsisent tests.

## Design Decisions

- the "Magic" nature of the api regarding how a sync call can be executed async - this is because of the retry mechanism - its important that assertions can retry, but if the assertion moves inside the promise (so for instance using Playwrights waitFor) then it makes it difficult to use more advanced expectations or things like inline snapshots.

## Reason for the name

Holly is typically portrayed as green and red and the aim of this test runner is to provide automation tests that are green or red but never flakey or unknown yellow.
