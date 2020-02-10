import React from "react";
import { Nav, ButtonGroup, Button } from "reactstrap";

const NavControls: React.FC = () => {
  return (
    <Nav className="mr-auto" navbar>
      <ButtonGroup>
        <Button>Start</Button>
        <Button>Stop</Button>
        <Button>Pause</Button>
      </ButtonGroup>
    </Nav>
  );
};

export default NavControls;
