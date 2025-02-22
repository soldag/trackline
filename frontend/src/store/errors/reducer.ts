import { createReducer, isPending, isRejected } from "@reduxjs/toolkit";

import { resetState } from "@/store/common/actions";
import { dismissAllErrors, dismissError } from "@/store/errors/actions";
import { getThunkTypePrefix } from "@/store/utils/thunks";
import { AppError } from "@/types/errors";

interface ErrorsState {
  byThunk: Record<string, AppError | undefined>;
}

const initialState: ErrorsState = {
  byThunk: {},
};

const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(resetState, () => initialState)

    .addCase(dismissError, (state, { payload: { typePrefix } }) => {
      state.byThunk = Object.fromEntries(Object.entries(state.byThunk));
      delete state.byThunk[typePrefix];
    })

    .addCase(dismissAllErrors, (state) => {
      state.byThunk = {};
    })

    .addMatcher(isPending, (state, action) => {
      const typePrefix = getThunkTypePrefix(action);
      delete state.byThunk[typePrefix];
    })

    .addMatcher(isRejected, (state, action) => {
      const { payload } = action;
      if (!payload || typeof payload !== "object" || !("error" in payload)) {
        console.warn(
          "Rejected action without error in the payload was received",
          action,
        );
        return;
      }

      const typePrefix = getThunkTypePrefix(action);
      state.byThunk[typePrefix] = payload.error as AppError;
    });
});

export default reducer;
