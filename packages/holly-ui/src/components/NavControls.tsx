import React from "react";
import { Nav, ButtonGroup, Button } from "reactstrap";

interface Props {
  run: () => void;
}

const NavControls: React.FC<Props> = ({ run }) => {
  return (
    <Nav className="mr-auto" navbar>
      <ButtonGroup>
        <Button onClick={run}>Start</Button>
        <Button>Stop</Button>
        <Button>Pause</Button>
      </ButtonGroup>
    </Nav>
  );
};

export default NavControls;
