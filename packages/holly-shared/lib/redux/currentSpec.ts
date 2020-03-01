import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type CurrentSpecSlice = {
  file?: string;
  tests?: ReadonlyArray<{
    name: string;
    commands: ReadonlyArray<string>;
  }>;
};

export const { actions, reducer } = createSlice({
  name: "currentSpec",
  initialState: {} as CurrentSpecSlice,
  reducers: {
    setFile: (state, { payload }: PayloadAction<string>) => ({
      file: payload
    }),
    setTests: (state, { payload }: PayloadAction<ReadonlyArray<string>>) => ({
      ...state,
      tests: payload.map(name => ({ name, commands: [] }))
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
