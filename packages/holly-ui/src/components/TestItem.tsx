import React, { useCallback } from "react";
import { ButtonGroup, Button } from "reactstrap";
import {
  TestSlice,
  actions,
  TEST_STATE_DISABLED,
  TEST_STATE_FOCUSSED,
  TEST_STATE_NORMAL
} from "holly-shared";
import { useDispatch } from "react-redux";

interface Props {
  test: TestSlice;
  isDisabled: boolean;
}

const TestItem: React.FC<Props> = ({ test, isDisabled }) => {
  const dispatch = useDispatch();
  const { id, state } = test;

  const toggleFocus = useCallback(() => {
    const newState =
      state !== TEST_STATE_FOCUSSED ? TEST_STATE_FOCUSSED : TEST_STATE_NORMAL;
    dispatch(
      actions.currentSpec.setTestState({
        id,
        state: newState
      })
    );
  }, [dispatch, state, id]);

  const toggleDisabled = useCallback(() => {
    const newState =
      state !== TEST_STATE_DISABLED ? TEST_STATE_DISABLED : TEST_STATE_NORMAL;
    dispatch(
      actions.currentSpec.setTestState({
        id,
        state: newState
      })
    );
  }, [dispatch, state, id]);

  return (
    <div data-test-state={test.state} data-test-id="test">
      <span style={{ color: isDisabled ? "grey" : "black" }}>{test.name}</span>
      <ButtonGroup>
        <Button onClick={toggleFocus}>F</Button>
        <Button onClick={toggleDisabled}>D</Button>
      </ButtonGroup>
      <div className="tst-command-list">
        {test.commands.map(commandName => (
          <div>{commandName}</div>
        ))}
      </div>
    </div>
  );
};

export default TestItem;
