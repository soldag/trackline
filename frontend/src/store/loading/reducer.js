import { createReducer } from "@reduxjs/toolkit";

import actions from "@/store/actions";
import { resetState } from "@/store/common/actions";
import { isFulfill, isTrigger } from "@/store/utils/matchers";
import { getRoutinePrefix } from "@/utils/routines";

const routinePrefixes = actions.map(getRoutinePrefix).filter((p) => p);
const initialState = {
  byRoutine: Object.fromEntries(routinePrefixes.map((p) => [p, false])),
};

const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(resetState, () => initialState)

    .addMatcher(isTrigger(...actions), (state, action) => {
      const prefix = getRoutinePrefix(action);
      state.byRoutine[prefix] = true;
    })

    .addMatcher(isFulfill(...actions), (state, action) => {
      const prefix = getRoutinePrefix(action);
      state.byRoutine[prefix] = false;
    });
});

export default reducer;
