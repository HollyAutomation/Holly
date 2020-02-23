import WebSocket = require("ws");
import Debug from "debug";

const debug = Debug("holly:open:wsServer");

let server: WebSocket.Server;

interface WebSocketWithAlive extends WebSocket {
  isAlive: boolean;
}

let interval: NodeJS.Timeout;

interface HollyUI {
  getSpecs: () => Array<string>;
  runSpec: (spec: string) => Promise<Array<string>>;
}
const MSG_SPECS = "specs";
const MSG_RUN_SPEC = "runSpec";
const MSG_TESTS = "tests";

export const start = (hollyUI: HollyUI) => {
  server = new WebSocket.Server({ port: 8080 });

  server.on("error", e => debug(`server websocket error - ${e}`));

  server.on("connection", function connection(ws: WebSocketWithAlive) {
    ws.isAlive = true;
    ws.on("pong", function heartbeat() {
      ws.isAlive = true;
    });

    ws.on("message", function incoming(message: string) {
      debug(`received ${message}`);
      const msgObj = JSON.parse(message);
      switch (msgObj.type) {
        case MSG_RUN_SPEC:
          hollyUI.runSpec(msgObj.data).then(tests => {
            ws.send(JSON.stringify({ type: MSG_TESTS, data: tests }));
          });
          break;
      }
    });

    ws.on("error", function incoming(e) {
      debug(`websocket error - ${e}`);
    });

    ws.send(JSON.stringify({ type: MSG_SPECS, data: hollyUI.getSpecs() }));
  });

  interval = setInterval(function ping() {
    server.clients.forEach(
      // @ts-ignore
      (ws: WebSocketWithAlive) => {
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
        ws.ping(() => {});
      }
    );
  }, 30000);
};

export const stop = () => {
  clearTimeout(interval);
  server.close();
};
