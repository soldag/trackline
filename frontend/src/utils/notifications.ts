import { Action, ActionCreator } from "@reduxjs/toolkit";
import { camelizeKeys } from "humps";
import { useCallback, useMemo, useState } from "react";
import useWebSocket from "react-use-websocket";

import tracklineApi from "@/api/trackline";
import {
  WS_RECONNECT_MAX_INTERVAL,
  WS_RECONNECT_MIN_INTERVAL,
} from "@/constants";
import {
  correctionProposed,
  correctionVoted,
  creditsGuessCreated,
  gameAborted,
  gameStarted,
  playerJoined,
  playerLeft,
  releaseYearGuessCreated,
  trackBought,
  trackExchanged,
  turnCompleted,
  turnCreated,
  turnPassed,
  turnScored,
} from "@/store/games";
import { useAppDispatch } from "@/utils/hooks";

const actionsByType: Record<string, ActionCreator<Action> | undefined> = {
  player_joined: playerJoined,
  player_left: playerLeft,
  game_started: gameStarted,
  game_aborted: gameAborted,
  new_turn: turnCreated,
  release_year_guess_created: releaseYearGuessCreated,
  credits_guess_created: creditsGuessCreated,
  track_exchanged: trackExchanged,
  turn_passed: turnPassed,
  turn_completed: turnCompleted,
  turn_scored: turnScored,
  track_bought: trackBought,
  correction_proposed: correctionProposed,
  correction_voted: correctionVoted,
};

export const useNotifications = ({
  gameId,
  onReconnect,
}: {
  gameId?: string;
  onReconnect?: () => void;
}) => {
  const dispatch = useAppDispatch();
  const [wasConnected, setWasConnected] = useState(false);

  const handleOpen = useCallback(() => {
    if (wasConnected) {
      onReconnect?.();
    }
    setWasConnected(true);
  }, [wasConnected, onReconnect]);

  const handleMessage = useCallback(
    ({ data }: MessageEvent) => {
      let notification;
      try {
        notification = camelizeKeys(JSON.parse(data));
      } catch {
        console.warn("Invalid notification received", data);
        return;
      }

      const { type, payload } = notification;
      const action = actionsByType[type];
      if (action) {
        dispatch(action(payload));
      } else {
        console.warn("Unknown notification received", data);
      }
    },
    [dispatch],
  );

  const webSocketUrl = useMemo(
    () => (gameId ? tracklineApi.notifications.getWebSocketUrl(gameId) : null),
    [gameId],
  );

  useWebSocket(
    webSocketUrl,
    {
      retryOnError: true,
      shouldReconnect: () => true,
      reconnectAttempts: Infinity,
      reconnectInterval: (retries) => {
        const interval = 2 ** retries * WS_RECONNECT_MIN_INTERVAL;
        return Math.min(interval, WS_RECONNECT_MAX_INTERVAL);
      },
      onOpen: handleOpen,
      onMessage: handleMessage,
    },
    !!webSocketUrl,
  );
};
