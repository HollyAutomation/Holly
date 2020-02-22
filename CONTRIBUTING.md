# Dev Setup

```
npm i
npx lerna bootstrap
```

Note: you may get some problems with `npm install` so you can run alternatively:

```
npm i
npx lerna exec npm i
npx lerna link
```

# Testing changes to open

First build and watch the ui by running this in packages/holly-ui

```
cd packages/holly-ui
npm run start
```

Then in a different terminal, watch for server changes in packages/holly

```
cd packages/holly
npm run build:watch
```

In a different terminal you can start an instance of holly that the ui will connect to:

```
cd packages/holly
npm run test:passes:open
```

and now the UI will connect to it and show a list of the specs from the passes folder.
