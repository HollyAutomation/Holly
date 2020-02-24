import React from "react";
import { ListGroup } from "reactstrap";
import { ButtonGroup, Button } from "reactstrap";

interface Props {
  tests: ReadonlyArray<string>;
}

const TestList: React.FC<Props> = ({ tests }) => {
  return (
    <>
      <ListGroup className="tst-test-list">
        {tests.map((test: string, index: number) => (
          <div>
            {test}
            <ButtonGroup>
              <Button>Focus</Button>
              <Button>Disable</Button>
            </ButtonGroup>
          </div>
        ))}
      </ListGroup>
    </>
  );
};

export default TestList;
