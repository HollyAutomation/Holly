# Dev Setup

```
npm i
npx lerna bootstrap
```

# Testing changes to open

First build and watch the ui and holly and starts the ui in a browser

```
lerna run build:watch --stream
```

In a different terminal you can start an instance of holly that the ui will connect to:

```
cd packages/holly
npm run test:passes:open
```

and now the UI will connect to it and show a list of the specs from the passes folder.
