Shakespeare

A testing framework built around playwright and mocha.

Features

Retry tests - individual tests can retry as in mocha
Retry assertions - tests will wait for assertions to be true
Inline snapshots - Jest style toMatchInlineSnapshot
UI with ability to select test file, test to run, pause, step through, update snapshots

TODO:

[x] - playwright integration POC
[x] - Retry assertions POC
[x] - toMatchInlineSnapshot POC
[ ] - UI POC
[ ] - Assertions - are we going to essentially build our own assertions or use chai?
[ ] - parallel tests POC. page or context? (link to caching...)
[ ] - Unit Tests
[ ] - Eslint
[ ] - TypeScript
[ ] - Integration tests using UI
[ ] - Retry tests POC
[ ] - command first argument - object with various things in? { shakespeare, stack, playwright }?
[ ] - more complete API mirroring playwright
[ ] - support multiple pages
[ ] - support multi browsers
[ ] - snapshot serializers
[ ] - pick up config for use as an external package
[ ] - ability to extend commands
[ ] - Documentation
[ ] - Code coverage collection
[ ] - Different assertion styles
[ ] - Mocking time?
[ ] - wait for finished?
[ ] - lifecycle/cache clearing?
[ ] - response mocking (easy plugin to playwright)

## Example

```
describe("Integration", () => {
  it("works", () => {
    sp.newPage("http://www.google.com");
    sp.$("input[type=text]").type("hello");
    sp.$("input[type=text]")
      .value()
      .shouldMatchInlineSnapshot(`'hello'`);
  });
});
```
