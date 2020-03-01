import React, { useEffect, useState } from "react";
import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import { Action, StoreEnhancer, Reducer, Store, AnyAction } from "redux";
import { Provider } from "react-redux";
import { rootReducer } from "holly-shared";
import App from "./App";

let ws: WebSocket;

type DispatchHere<A extends Action = AnyAction> = {
  dispatchHere: (action: A) => A;
};

const sendToNodeEnhancer: StoreEnhancer = createStore => <
  S,
  A extends Action = AnyAction
>(
  reducer: Reducer<S, A>,
  initialState?: any
): Store<S, A> & DispatchHere<A> => {
  const store = createStore(reducer, initialState);

  return {
    ...store,
    dispatchHere: store.dispatch,
    // @ts-ignore - cannot get this to pass typescript
    dispatch(action: A) {
      ws.send(JSON.stringify(action));
    }
  };
};

type StoreType =
  | (EnhancedStore<ReturnType<typeof rootReducer>> & DispatchHere)
  | null;

// can't use useEffect because we only want to load the ws once, but allow the sub dependency of store to update
let currentStore: StoreType = null;

const Connector: React.FC = () => {
  const [store, setStore] = useState<StoreType>(null);

  useEffect(() => {
    let timer: number | null;

    function open(event: Event) {}

    function message(event: MessageEvent) {
      if (!currentStore) {
        // @ts-ignore - doesn't work out the enhancers
        currentStore = configureStore({
          reducer: rootReducer,
          enhancers: [sendToNodeEnhancer],
          preloadedState: JSON.parse(event.data)
        });
        setStore(currentStore);
      } else {
        currentStore.dispatchHere(JSON.parse(event.data));
      }
    }

    function close() {
      console.log("ws: closed");
      if (!timer) {
        timer = setTimeout(create, 500);
      }
    }

    function error() {
      console.log("ws: error");
      if (!timer) {
        timer = setTimeout(create, 500);
      }
    }

    function create() {
      timer = null;
      if (ws) {
        ws.onerror = null;
        ws.onclose = null;
        ws.close();
      }
      if (currentStore) {
        currentStore = null;
        setStore(null);
      }
      ws = new WebSocket("ws://localhost:8080");
      ws.onopen = open;
      ws.onerror = error;
      ws.onmessage = message;
      ws.onclose = close;
    }

    create();
  }, []);

  if (store) {
    return (
      <Provider store={store}>
        <App />
      </Provider>
    );
  } else {
    return <div>Loading...</div>;
  }
};

export default Connector;
