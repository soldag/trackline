import { isRejected } from "@reduxjs/toolkit";

import { enableBuyTrackReminder } from "@/store/games/actions";
import { fetchGame } from "@/store/games/thunks";
import { createAppListenerMiddleware } from "@/store/utils/middleware";
import { AppError, ErrorCode } from "@/types/errors";
import { RootState } from "@/types/store";

const getUserTokens = (state: RootState): number | undefined => {
  const currentUserId = state.auth.user?.id;
  return state.games.game?.players.find((p) => p.userId === currentUserId)
    ?.tokens;
};

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

middleware.startListening({
  predicate: (_, currentState, previousState) => {
    const oldTokens = getUserTokens(previousState);
    const newTokens = getUserTokens(currentState);
    return oldTokens !== newTokens;
  },
  effect: (_, listenerApi) => {
    listenerApi.dispatch(enableBuyTrackReminder());
  },
});

export default middleware.middleware;
