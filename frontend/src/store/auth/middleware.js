import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";

import { resetState } from "@/store/common";

import { invalidateSession } from "./actions";
import { logout } from "./thunks";

const middleware = createListenerMiddleware();

middleware.startListening({
  matcher: isAnyOf(invalidateSession, logout.fulfilled),
  effect: (_, listenerApi) => listenerApi.dispatch(resetState()),
});

export default middleware.middleware;
