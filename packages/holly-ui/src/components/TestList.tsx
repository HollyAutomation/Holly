import React from "react";
import { ListGroup } from "reactstrap";
import {
  rootReducer,
  TestSlice,
  TEST_STATE_DISABLED,
  TEST_STATE_FOCUSSED
} from "holly-shared";

import TestItem from "./TestItem";

type TestsType = NonNullable<
  ReturnType<typeof rootReducer>["currentSpec"]["tests"]
>;

interface Props {
  tests: TestsType;
}

const TestList: React.FC<Props> = ({ tests }) => {
  const hasFocussedTests = tests.some(
    test => test.state === TEST_STATE_FOCUSSED
  );
  return (
    <>
      <ListGroup className="tst-test-list">
        {tests.map((test: TestSlice) => (
          <TestItem
            test={test}
            key={test.id}
            isDisabled={
              test.state === TEST_STATE_DISABLED ||
              (hasFocussedTests && test.state !== TEST_STATE_FOCUSSED)
            }
          />
        ))}
      </ListGroup>
    </>
  );
};

export default TestList;
