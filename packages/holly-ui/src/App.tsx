import React, { useState } from "react";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  Button
} from "reactstrap";

declare global {
  interface Window {
    __holly: {
      start: () => void;
      stop: () => void;
      pause: () => void;
    };
  }
}

const App: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div className="App">
      <Navbar color="light" light expand="md" fixed="top">
        <NavbarBrand href="/">Holly</NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="mr-auto" navbar>
            <NavItem>
              <Button onClick={() => window.__holly.start()}>Start</Button>
            </NavItem>
            <NavItem>
              <Button onClick={() => window.__holly.stop()}>Stop</Button>
            </NavItem>
            <NavItem>
              <Button onClick={() => window.__holly.pause()}>Pause</Button>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    </div>
  );
};

export default App;
