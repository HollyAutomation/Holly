import * as redux from "./redux";

import {
  TEST_STATE_NORMAL,
  TEST_STATE_FOCUSSED,
  TEST_STATE_DISABLED,
  testState,
  TestSlice
} from "./redux/currentSpec";

export {
  testState,
  TestSlice,
  TEST_STATE_DISABLED,
  TEST_STATE_FOCUSSED,
  TEST_STATE_NORMAL
};

export const actions = redux.actions;
export const rootReducer = redux.rootReducer;
export type RootState = redux.RootState;
