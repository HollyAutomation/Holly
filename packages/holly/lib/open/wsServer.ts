import WebSocket = require("ws");

let server: WebSocket.Server;

interface WebSocketWithAlive extends WebSocket {
  isAlive: boolean;
}

let interval: NodeJS.Timeout;

interface HollyUI {
  getSpecs: () => Array<string>;
}
const MSG_SPECS = "specs";

export const start = (hollyUI: HollyUI) => {
  server = new WebSocket.Server({ port: 8080 });

  server.on("error", () => console.log("error on server"));

  server.on("connection", function connection(ws: WebSocketWithAlive) {
    ws.isAlive = true;
    ws.on("pong", function heartbeat() {
      console.log("pong");
      ws.isAlive = true;
    });

    ws.on("message", function incoming(message) {
      console.log("received: %s", message);
    });

    ws.on("error", function incoming() {
      console.log("error");
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
