import { isAnyOf } from "@reduxjs/toolkit";

import { resetState } from "@/store/common";
import { createAppListenerMiddleware } from "@/store/utils/middleware";

import { invalidateSession } from "./actions";
import { logout } from "./thunks";

const middleware = createAppListenerMiddleware();

middleware.startListening({
  matcher: isAnyOf(invalidateSession, logout.fulfilled),
  effect: (_, listenerApi) => {
    listenerApi.dispatch(resetState());
  },
});

export default middleware.middleware;
