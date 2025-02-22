import { Action, ThunkDispatch } from "@reduxjs/toolkit";

import rootReducer from "@/store/rootReducer";

export type AnyAsyncThunk = {
  typePrefix: string;
};

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = ThunkDispatch<RootState, void, Action>;
