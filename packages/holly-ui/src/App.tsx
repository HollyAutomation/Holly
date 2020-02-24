import React, { useEffect, useState, useCallback } from "react";
import { Container, Row, Col } from "reactstrap";
import Navigation from "./components/Navigation";
import SpecList from "./components/SpecList";
import Footer from "./components/Footer";
import TestList from "./components/TestList";

// TODO - how to share? cross package since this is compiled before publish?
const MSG_SPECS = "specs";
const MSG_OPEN_SPEC = "openSpec";
const MSG_TESTS = "tests";
const MSG_RUN = "run";

let ws: WebSocket;

const MODE_CHOOSE_SPEC = 1;
const MODE_RUN_SPEC = 2;

const App: React.FC = () => {
  const [specs, setSpecs] = useState([]);
  const [mode, setMode] = useState(MODE_CHOOSE_SPEC);
  const [tests, setTests] = useState([]);

  const chooseSpec = useCallback((spec: string) => {
    if (ws) {
      setMode(MODE_RUN_SPEC);
      ws.send(
        JSON.stringify({
          type: MSG_OPEN_SPEC,
          data: spec
        })
      );
    }
  }, []);

  const run = useCallback(() => {
    if (ws) {
      ws.send(
        JSON.stringify({
          type: MSG_RUN
        })
      );
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timer | null;

    function open(event: Event) {}

    function message(event: MessageEvent) {
      var msg = JSON.parse(event.data);

      switch (msg.type) {
        case MSG_SPECS:
          setSpecs(msg.data);
          break;
        case MSG_TESTS:
          setTests(msg.data);
          break;
      }
    }

    function close() {
      console.log("ws: closed");
      if (!timer) {
        timer = setTimeout(create, 500);
      }
    }

    function error() {
      console.log("ws: error");
      if (!timer) {
        timer = setTimeout(create, 500);
      }
    }

    function create() {
      if (ws) {
        ws.onerror = null;
        ws.onclose = null;
        ws.close();
      }
      timer = null;
      ws = new WebSocket("ws://localhost:8080");
      ws.onopen = open;
      ws.onerror = error;
      ws.onmessage = message;
      ws.onclose = close;
    }

    create();
  }, []);

  return (
    <div className="App">
      <Navigation isShowingSpec={mode === MODE_RUN_SPEC} run={run} />
      <Container fluid>
        <Row>
          <Col>
            {mode === MODE_CHOOSE_SPEC ? (
              <SpecList specs={specs} chooseSpec={chooseSpec} />
            ) : (
              <TestList tests={tests} />
            )}
          </Col>
        </Row>
        <Footer />
      </Container>
    </div>
  );
};

export default App;
