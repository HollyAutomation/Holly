# Dev Setup

```
yarn
```

# Testing changes to open

First build and watch the ui by running this in packages/holly-ui

```
yarn workspace holly-ui run start
```

Then in a different terminal, watch for server changes in packages/holly

```
yarn workspace holly run build:watch
```

Either build the shared package or watch it if you plan on making changes:

```
yarn workspace holly-shared run build:watch
```

In a different terminal you can start an instance of holly that the ui will connect to:

```
yarn workspace holly run test:passes:open
```

and now the UI will connect to it and show a list of the specs from the passes folder.

If you make changes to the server, stop the `yarn test:passes:open` and restart it. The website will reconnect.
