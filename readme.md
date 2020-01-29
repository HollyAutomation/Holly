## Holly

A reliable and simple automated testing framework built around playwright and mocha with Jest snapshots thrown in, running in parallel.

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

## TODO for first initial version:

- [x] playwright integration POC
- [x] Retry assertions POC
- [x] toMatchInlineSnapshot POC
- [x] name change - Holly?
- [x] Allow use with promises if you want
- [x] parallel tests POC.
- [x] Eslint
- [x] TypeScript?
- [ ] Assertions - build simple set of our own
- [ ] Integration tests using UI
- [ ] Retry tests POC
- [ ] move these checkboxes into issues
- [ ] Unit Tests
- [ ] command first argument - object with various things in? { holly, stack, playwright }?
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
describe("Integration", () => {
  it("works", () => {
    await holly.newPage("http://www.google.com");
    await holly.$("input[type=text]").type("hello");
    await holly.$("input[type=text]")
      .value()
      .shouldMatchInlineSnapshot(`'hello'`);
  });
});
```

## Async vs Sync

Holly can be used in a synchronous way (no `async` or `await`'s needed) if that is what you prefer.

However it has two downsides:

- Debugging a test is more difficult as you cannot step through the commands
- If you need to access the playwright API, you will need to use `async` and `await` so you may find yourself having inconsisent tests.

## Reason for the name

Holly is typically portrayed as green and red and the aim of this test runner is to provide automation tests that are green or red but never flakey or unknown yellow.
