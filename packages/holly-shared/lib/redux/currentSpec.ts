import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type CurrentSpecSlice = {
  file?: string;
  tests?: ReadonlyArray<string>;
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
      tests: payload
    }),
    run: state => state
  }
});
