import React, { useState } from "react";
import {
  Container,
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand
} from "reactstrap";
import NavControls from "./NavControls";

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <Navbar color="light" light expand="md">
      <Container fluid>
        <NavbarBrand href="/">Holly</NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <NavControls />
        </Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
