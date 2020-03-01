import React from "react";
import { ListGroup } from "reactstrap";
import { ButtonGroup, Button } from "reactstrap";
import { rootReducer } from "holly-shared";

type TestsType = NonNullable<
  ReturnType<typeof rootReducer>["currentSpec"]["tests"]
>;

interface Props {
  tests: TestsType;
}

const TestList: React.FC<Props> = ({ tests }) => {
  return (
    <>
      <ListGroup className="tst-test-list">
        {tests.map(
          (
            test: { name: string; commands: ReadonlyArray<string> },
            index: number
          ) => (
            <div>
              {test.name}
              <ButtonGroup>
                <Button>Focus</Button>
                <Button>Disable</Button>
              </ButtonGroup>
              <div className="tst-command-list">
                {test.commands.map(commandName => (
                  <div>{commandName}</div>
                ))}
              </div>
            </div>
          )
        )}
      </ListGroup>
    </>
  );
};

export default TestList;
