import { createReducer } from "@reduxjs/toolkit";

import { resetState } from "@/store/common/actions";

import { setTimeDeviation } from "./actions";

const initialState = {
  timeDeviation: {
    trackline: 0,
    spotify: 0,
  },
};

const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(resetState, () => initialState)

    .addCase(setTimeDeviation, (state, { payload: { service, value } }) => {
      state.timeDeviation[service] = value;
    });
});

export default reducer;
