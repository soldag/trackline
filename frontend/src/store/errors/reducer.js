import { createReducer, isPending, isRejected } from "@reduxjs/toolkit";

import { resetState } from "@/store/common/actions";
import { dismissAllErrors, dismissError } from "@/store/errors/actions";
import { getThunkTypePrefix } from "@/store/utils/thunks";

const initialState = {
  byThunk: {},
};

const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(resetState, () => initialState)

    .addCase(dismissError, (state, { payload: { typePrefix } }) => {
      state.byThunk[typePrefix] = null;
    })

    .addCase(dismissAllErrors, (state) => {
      state.byThunk = {};
    })

    .addMatcher(isPending, (state, action) => {
      const typePrefix = getThunkTypePrefix(action);
      state.byThunk[typePrefix] = null;
    })

    .addMatcher(isRejected, (state, action) => {
      const { payload: { error } = {} } = action;
      const typePrefix = getThunkTypePrefix(action);
      state.byThunk[typePrefix] = error;
    });
});

export default reducer;
