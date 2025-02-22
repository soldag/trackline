import {
  createReducer,
  isAnyOf,
  isFulfilled,
  isPending,
  isRejected,
} from "@reduxjs/toolkit";

import { resetState } from "@/store/common/actions";
import { getThunkTypePrefix } from "@/store/utils/thunks";

interface LoadingState {
  byThunk: Record<string, boolean | undefined>;
}

const initialState: LoadingState = {
  byThunk: {},
};

const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(resetState, () => initialState)

    .addMatcher(isPending, (state, action) => {
      const prefix = getThunkTypePrefix(action);
      state.byThunk[prefix] = true;
    })

    .addMatcher(isAnyOf(isFulfilled, isRejected), (state, action) => {
      const prefix = getThunkTypePrefix(action);
      state.byThunk[prefix] = false;
    });
});

export default reducer;
