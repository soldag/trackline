import { createListenerMiddleware, isRejected } from "@reduxjs/toolkit";

import { ERROR_CODES } from "@/constants";
import { fetchGame } from "@/store/games/thunks";

const middleware = createListenerMiddleware();

middleware.startListening({
  matcher: isRejected,
  effect: (action, listenerApi) => {
    const gameId = listenerApi.getState().games.game?.id;
    if (!gameId || fetchGame.rejected.match(action)) return;

    const error = action.payload?.error;
    const code = error?.code;
    const statusCode = error?.extra?.statusCode;
    if (code === ERROR_CODES.API && statusCode >= 400) {
      // Fetch current game after error to sync with backend in case of inconsistencies
      listenerApi.dispatch(fetchGame({ gameId }));
    }
  },
});

export default middleware.middleware;
