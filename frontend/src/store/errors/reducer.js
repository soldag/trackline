import { createReducer } from "@reduxjs/toolkit";

import actions from "store/actions";
import { resetState } from "store/common/actions";
import { dismissAllErrors, dismissError } from "store/errors/actions";
import { isFailure, isTrigger } from "store/utils/matchers";
import { getRoutinePrefix } from "utils/routines";

const routinePrefixes = actions.map(getRoutinePrefix).filter((p) => p);
const initialState = {
  byRoutine: Object.fromEntries(routinePrefixes.map((p) => [p, null])),
};

const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(resetState, () => initialState)

    .addCase(dismissError, (state, action) => {
      const {
        payload: { actionType },
      } = action;

      const prefix = getRoutinePrefix(actionType);
      state.byRoutine[prefix] = null;
    })

    .addCase(dismissAllErrors, () => initialState)

    .addMatcher(isTrigger(...actions), (state, action) => {
      const prefix = getRoutinePrefix(action);
      state.byRoutine[prefix] = null;
    })

    .addMatcher(isFailure(...actions), (state, action) => {
      const {
        payload: { error },
      } = action;

      const prefix = getRoutinePrefix(action);
      state.byRoutine[prefix] = error;
    });
});

export default reducer;
