import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const TEST_STATE_NORMAL = "normal";
export const TEST_STATE_FOCUSSED = "focussed";
export const TEST_STATE_DISABLED = "disabled";

export type testState =
  | typeof TEST_STATE_DISABLED
  | typeof TEST_STATE_FOCUSSED
  | typeof TEST_STATE_NORMAL;

export type TestSlice = {
  name: string;
  commands: ReadonlyArray<string>;
  id: string;
  state: testState;
};

type CurrentSpecSlice = {
  file?: string;
  tests?: ReadonlyArray<TestSlice>;
};

export const { actions, reducer } = createSlice({
  name: "currentSpec",
  initialState: {} as CurrentSpecSlice,
  reducers: {
    setFile: (state, { payload }: PayloadAction<string>) => ({
      file: payload
    }),
    setTests: (
      state,
      {
        payload
      }: PayloadAction<
        ReadonlyArray<{ name: string; id: string; state?: testState }>
      >
    ) => ({
      ...state,
      tests: payload.map(({ name, id, state }) => ({
        name,
        commands: [],
        id,
        state: state || TEST_STATE_NORMAL
      }))
    }),
    setTestState: (
      state,
      { payload }: PayloadAction<{ id: string; state: testState }>
    ) => ({
      ...state,
      tests: state.tests?.map(test => {
        if (test.id === payload.id) {
          return {
            ...test,
            state: payload.state
          };
        }
        return test;
      })
    }),
    run: state => state,
    addCommand: (
      state,
      {
        payload: { testName, commandName }
      }: PayloadAction<{
        testName: string;
        commandName: string;
      }>
    ) => {
      return {
        ...state,
        tests: state.tests?.map(test => {
          if (test.name === testName) {
            return {
              ...test,
              commands: [...test.commands, commandName]
            };
          }
          return test;
        })
      };
    }
  }
});
