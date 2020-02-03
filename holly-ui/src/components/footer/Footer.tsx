import React from "react";
import { Container } from "reactstrap";

class Footer extends React.Component {
  render() {
    return (
      <footer className="footer">
        <Container fluid>
          <div className="copyright">
            © {new Date().getFullYear()}{" "}
            <a
              href="javascript:void(0)"
              rel="noopener noreferrer"
              target="_blank"
            >
              Holly
            </a>{" "}
            v 0.0.1
          </div>
        </Container>
      </footer>
    );
  }
}

export default Footer;
