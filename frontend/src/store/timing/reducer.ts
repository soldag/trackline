import { createReducer } from "@reduxjs/toolkit";

import { resetState } from "@/store/common/actions";
import { ServiceType } from "@/types/api";

import { setTimeDeviation } from "./actions";

interface TimingState {
  timeDeviation: { [key in ServiceType]: number };
}

const initialState: TimingState = {
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
