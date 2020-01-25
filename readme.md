Shakespear

A testing framework built around playwright and mocha.

Features

Retry tests - individual tests can retry as in mocha
Retry assertions - tests will wait for assertions to be true
Inline snapshots - Jest style toMatchInlineSnapshot
UI with ability to select test file, test to run, pause, step through, update snapshots

Future Features

Ability to record
Sync style test
Code coverage collection

Example

const page = await shakespear.visit();

await page.get('a').isVisible().shouldEqual(true);
await page.get('a').doesExist().shouldEqual(true);

