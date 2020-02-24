import React from "react";
import { Container, Navbar, NavbarBrand } from "reactstrap";
import NavControls from "./NavControls";

interface Props {
  isShowingSpec: boolean;
  run: () => void;
}

const Navigation: React.FC<Props> = ({ isShowingSpec, run }) => {
  return (
    <Navbar color="light" light expand="md">
      <Container fluid>
        <NavbarBrand href="/">Holly</NavbarBrand>
        {isShowingSpec && <NavControls run={run} />}
      </Container>
    </Navbar>
  );
};

export default Navigation;
