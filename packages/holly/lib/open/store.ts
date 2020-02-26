import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { Middleware, Action } from "redux";
import { rootReducer } from "../../../holly-shared";

export default (actionCallback: (action: Action) => void) => {
  const actionEmitter: Middleware = (/*{ getState, dispatch }*/) => next => action => {
    actionCallback(action);
    return next(action);
  };

  const middleware = [...getDefaultMiddleware(), actionEmitter];

  return configureStore({ reducer: rootReducer, middleware });
};
