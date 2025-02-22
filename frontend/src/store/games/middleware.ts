import { isRejected } from "@reduxjs/toolkit";

import { fetchGame } from "@/store/games/thunks";
import { createAppListenerMiddleware } from "@/store/utils/middleware";
import { AppError, ErrorCode } from "@/types/errors";

const middleware = createAppListenerMiddleware();

middleware.startListening({
  matcher: isRejected,
  effect: (action, listenerApi) => {
    const { payload } = action;
    if (!payload || typeof payload !== "object" || !("error" in payload)) {
      return;
    }

    const gameId = listenerApi.getState().games.game?.id;
    if (!gameId || fetchGame.rejected.match(action)) {
      return;
    }

    const error = payload?.error as AppError;
    const code = error.code;
    const statusCode = error.extra?.statusCode;
    if (
      code === ErrorCode.TracklineApi &&
      statusCode != null &&
      statusCode >= 400
    ) {
      // Fetch current game after error to sync with backend in case of inconsistencies
      listenerApi.dispatch(fetchGame({ gameId }));
    }
  },
});

export default middleware.middleware;
