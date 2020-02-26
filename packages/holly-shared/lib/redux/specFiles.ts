import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type SpecFilesSlice = ReadonlyArray<string>;

export const { actions, reducer } = createSlice({
  name: "specFiles",
  initialState: [] as SpecFilesSlice,
  reducers: {
    setSpecFiles: (state, { payload }: PayloadAction<SpecFilesSlice>) => payload
  }
});
