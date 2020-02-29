import { combineReducers } from "@reduxjs/toolkit";
import * as specFiles from "./specFiles";
import * as currentSpec from "./currentSpec";

export const actions = {
  specFiles: specFiles.actions,
  currentSpec: currentSpec.actions
};

export const rootReducer = combineReducers({
  specFiles: specFiles.reducer,
  currentSpec: currentSpec.reducer
});

export type RootState = ReturnType<typeof rootReducer>;
