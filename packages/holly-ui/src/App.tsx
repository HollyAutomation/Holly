import React from "react";
import { Container, Row, Col } from "reactstrap";
import Navigation from "./components/Navigation";
import SpecList from "./components/SpecList";
import { Spec } from "./components/SpecListItem";
import Footer from "./components/Footer";

declare global {
  interface Window {
    __holly: {
      start: () => void;
      stop: () => void;
      pause: () => void;
      specs: Array<Spec>;
    };
  }
}

const App: React.FC = () => {
  const specs = [
    // TODO: Fill with actual specs
    { path: "./src/tests/example-0.spec.js", displayName: "example-0.spec.js" },
    { path: "./src/tests/example-1.spec.js", displayName: "example-1.spec.js" },
    { path: "./src/tests/example-2.spec.js", displayName: "example-2.spec.js" },
    { path: "./src/tests/example-3.spec.js", displayName: "example-3.spec.js" },
    { path: "./src/tests/example-4.spec.js", displayName: "example-4.spec.js" }
  ];

  return (
    <div className="App">
      <Navigation />
      <Container fluid>
        <Row>
          <Col>
            <SpecList specs={specs} />
          </Col>
        </Row>
        <Footer />
      </Container>
    </div>
  );
};

export default App;
