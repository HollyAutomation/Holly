import WebSocket = require("ws");
import Debug from "debug";
import { Action } from "redux";

const debug = Debug("holly:open:wsServer");

let server: WebSocket.Server;

interface WebSocketWithAlive extends WebSocket {
  isAlive: boolean;
}

let interval: NodeJS.Timeout;

interface HollyUI {
  getState: () => any;
  dispatch: (action: Action) => void;
}
export const start = (hollyUI: HollyUI) => {
  const sessions: Array<WebSocket> = [];

  server = new WebSocket.Server({ port: 8080 });

  server.on("error", e => debug(`server websocket error - ${e}`));

  let timeoutId: NodeJS.Timeout | null = null;
  let triggerFinished: () => void;
  const finishedPromise = new Promise(resolve => {
    triggerFinished = resolve;
  });

  server.on("connection", function connection(ws: WebSocketWithAlive) {
    sessions.push(ws);
    ws.on("close", () => {
      debug("websocket close");
      const index = sessions.indexOf(ws);
      if (index >= 0) {
        sessions.splice(index, 1);
      }
      if (sessions.length === 0) {
        debug("no sessions open, so waiting to close");
        timeoutId = setTimeout(() => {
          debug("triggering close of open mode");
          triggerFinished();
        }, 500);
      }
    });
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    ws.isAlive = true;
    ws.on("pong", function heartbeat() {
      ws.isAlive = true;
    });

    ws.on("message", function incoming(message: string) {
      debug(`received ${message}`);
      const msgObj = JSON.parse(message);
      hollyUI.dispatch(msgObj);
    });

    ws.on("error", function incoming(e) {
      debug(`websocket error - ${e}`);
    });

    ws.send(JSON.stringify(hollyUI.getState()));
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

  return {
    finishedPromise,
    send(action: any) {
      sessions.forEach(ws => {
        ws.send(JSON.stringify(action));
      });
    }
  };
};

export const stop = () => {
  clearTimeout(interval);
  server.close();
};
