import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import Navigation from "./components/Navigation";
import SpecList from "./components/SpecList";
import Footer from "./components/Footer";

const MSG_SPECS = "specs";

let ws: WebSocket;

// test!!

const chooseSpec = (spec: string) => {
  if (ws) {
    ws.send(
      JSON.stringify({
        type: "runspec",
        data: spec
      })
    );
  }
};

const App: React.FC = () => {
  const [specs, setSpecs] = useState([]);

  useEffect(() => {
    let timer: NodeJS.Timer | null;

    function open(event: Event) {
      console.log("open");
      console.log(ws.readyState);
    }

    function message(event: MessageEvent) {
      var msg = JSON.parse(event.data);

      switch (msg.type) {
        case MSG_SPECS:
          setSpecs(msg.data);
          break;
      }
    }

    function close() {
      console.log("closed");
      if (!timer) {
        timer = setTimeout(create, 500);
      }
    }

    function error() {
      console.log("error");
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
      <Navigation />
      <Container fluid>
        <Row>
          <Col>
            <SpecList specs={specs} chooseSpec={chooseSpec} />
          </Col>
        </Row>
        <Footer />
      </Container>
    </div>
  );
};

export default App;
