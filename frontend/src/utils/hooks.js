import { camelizeKeys } from "humps";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";
import useWebSocket from "react-use-websocket";
import { toast } from "sonner";

import { useTheme } from "@mui/joy";

import tracklineApi from "@/api/trackline";
import SpotifyContext from "@/components/contexts/SpotifyContext";
import {
  WS_RECONNECT_MAX_INTERVAL,
  WS_RECONNECT_MIN_INTERVAL,
} from "@/constants";
import { dismissError } from "@/store/errors/actions";
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
import { getErrorMessage } from "@/utils/errors";

const NOTIFICATION_ACTIONS = {
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

export const useMountEffect = (effect) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useEffect(effect, []);
};

export const useUnmountEffect = (effect) => {
  const ref = useRef();
  ref.current = effect;

  useEffect(
    () => () => {
      const currentEffect = ref.current;
      if (currentEffect) {
        currentEffect();
      }
    },
    [],
  );
};

export const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

export const useUpdatingRef = (value) => {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
};

export const useEventListener = (target, type, listener, options) => {
  const savedListener = useUpdatingRef(listener);

  useEffect(() => {
    if (!target) return;

    const listener = (e) => savedListener.current(e);
    target.addEventListener(type, listener, options);
    return () => target.removeEventListener(type, listener, options);
  });
};

export const useInterval = (callback, delay, { autoStart = true } = {}) => {
  const savedCallback = useRef(callback);
  const [isActive, setIsActive] = useState(autoStart);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isActive || delay == null) return;

    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay, isActive]);

  const start = useCallback(() => setIsActive(true), []);
  const stop = useCallback(() => setIsActive(false), []);

  return { isActive, start, stop };
};

export const useCountdown = ({ start, end, updateInterval = 100 }) => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const { start: startInterval, stop: stopInterval } = useInterval(
    () => forceUpdate(),
    updateInterval,
    { autoStart: false },
  );

  useEffect(() => {
    if (start == null || end == null || end <= Date.now()) {
      stopInterval();
    } else {
      startInterval();
    }
  }, [start, end, startInterval, stopInterval]);

  let remaining = 0;
  let progress = 0;
  if (start != null && end != null) {
    const total = end - start;
    remaining = Math.max(0, end - Date.now());
    progress = total === 0 ? 1 : (total - remaining) / total;
  }

  return { progress, remaining };
};

export const useErrorSelector = (...thunks) => {
  const typePrefixes = thunks.map((a) => a.typePrefix);
  const typePrefix = useSelector((state) =>
    typePrefixes.find((p) => state.errors.byThunk[p]),
  );
  const error = useSelector((state) => state.errors.byThunk[typePrefix]);

  return { typePrefix, error };
};

export const useBreakpoint = (querySelector) => {
  const theme = useTheme();
  const query = querySelector(theme.breakpoints)?.replace("@media", "");
  return useMediaQuery({ query });
};

export const useLoadingSelector = (...thunks) => {
  const typePrefixes = thunks.map((a) => a.typePrefix);
  return useSelector((state) =>
    typePrefixes.some((typePrefix) => state.loading.byThunk[typePrefix]),
  );
};

export const useErrorToast = (...thunks) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const { typePrefix, error } = useErrorSelector(...thunks);

  const prevError = usePrevious(error);
  useEffect(() => {
    if (!error || error === prevError) return;

    const message = getErrorMessage(intl, error);
    toast.error(message, {
      onDismiss: () => dispatch(dismissError({ typePrefix })),
      onAutoClose: () => dispatch(dismissError({ typePrefix })),
    });
  }, [prevError, error, typePrefix, intl, dispatch]);
};

export const useNotifications = ({ gameId, onReconnect }) => {
  const dispatch = useDispatch();
  const [wasConnected, setWasConnected] = useState(false);

  const handleOpen = useCallback(() => {
    if (wasConnected) {
      onReconnect?.();
    }
    setWasConnected(true);
  }, [wasConnected, onReconnect]);

  const handleMessage = useCallback(
    ({ data }) => {
      let notification;
      try {
        notification = camelizeKeys(JSON.parse(data));
      } catch {
        console.warn("Invalid notification received", data);
        return;
      }

      const { type, payload } = notification;
      const action = NOTIFICATION_ACTIONS[type];
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

export const useSpotify = ({ requireAuth = false }) => {
  const { setIsRequired } = useContext(SpotifyContext);

  useMountEffect(() => () => setIsRequired(false));
  useEffect(() => setIsRequired(requireAuth), [requireAuth, setIsRequired]);
};
