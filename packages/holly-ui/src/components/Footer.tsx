import React from "react";
import { Container } from "reactstrap";

const Footer: React.FC = () => {
  return (
    <footer className="footer d-flex justify-content-center mt-auto">
      <div className="d-flex justify-content-between col-md-8 col-md-offset-2 mb-3 mt-5">
        <div className="align-left">
          <a
            className="font-weight-bold small"
            href="https://github.com/HollyAutomation/Holly"
            target="_blank"
          >
            GitHub
          </a>
          {" | "}
          <a className="font-weight-bold small" href="/" target="_blank">
            Documentation
          </a>
        </div>
        <div className="align-right small">Holly v0.0.1</div>
      </div>
    </footer>
  );
};

export default Footer;
