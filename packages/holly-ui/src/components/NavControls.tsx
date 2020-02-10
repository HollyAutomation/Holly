import React from "react";
import { Nav, ButtonGroup, Button } from "reactstrap";

const NavControls: React.FC = () => {
  return (
    <Nav className="mr-auto" navbar>
      <ButtonGroup>
        <Button onClick={() => window.__holly.start()}>Start</Button>
        <Button onClick={() => window.__holly.stop()}>Stop</Button>
        <Button onClick={() => window.__holly.pause()}>Pause</Button>
      </ButtonGroup>
    </Nav>
  );
};

export default NavControls;
