import React from "react";
import { ListGroup } from "reactstrap";

interface Props {
  tests: ReadonlyArray<string>;
}

const TestList: React.FC<Props> = ({ tests }) => {
  return (
    <>
      <ListGroup className="tst-test-list">
        {tests.map((test: string, index: number) => (
          <div>{test}</div>
        ))}
      </ListGroup>
    </>
  );
};

export default TestList;
