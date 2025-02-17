import { camelizeKeys } from "humps";
import {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";
import { toast } from "sonner";

import { useTheme } from "@mui/joy";

import api from "@/api/trackline";
import SpotifyContext from "@/components/contexts/SpotifyContext";
import { dismissError } from "@/store/errors/actions";
import { getErrorMessage } from "@/utils/errors";
import { getRoutinePrefix } from "@/utils/routines";

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

export const useErrorSelector = (...actions) => {
  const prefixes = actions.map(getRoutinePrefix);
  return useSelector(
    (state) =>
      prefixes
        .map((prefix) => state.errors.byRoutine[prefix])
        .filter((error) => error)[0],
  );
};

export const useBreakpoint = (querySelector) => {
  const theme = useTheme();
  const query = querySelector(theme.breakpoints)?.replace("@media", "");
  return useMediaQuery({ query });
};

export const useLoadingSelector = (...actions) => {
  const prefixes = actions.map(getRoutinePrefix);
  return useSelector((state) =>
    prefixes.some((prefix) => state.loading.byRoutine[prefix]),
  );
};

export const useErrorToast = (...actions) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const error = useErrorSelector(...actions);

  const prevError = usePrevious(error);
  useEffect(() => {
    if (!error || error === prevError) return;

    const {
      trigger: { type: actionType },
    } = error;
    const message = getErrorMessage(intl, error);
    toast.error(message, {
      onDismiss: () => dispatch(dismissError({ actionType })),
      onAutoClose: () => dispatch(dismissError({ actionType })),
    });
  }, [prevError, error, intl, dispatch]);
};

export const useNotifications = ({ gameId, onMessage }) => {
  const [webSocket, setWebSocket] = useState();

  const connect = useCallback(() => {
    const url = api.notifications.getWebSocketUrl(gameId);
    const ws = new WebSocket(url);
    setWebSocket(ws);
  }, [gameId]);

  const disconnect = useCallback(() => {
    if (!webSocket || webSocket.readyState !== webSocket.OPEN) return;
    webSocket.close(1001);
  }, [webSocket]);

  const prevGameId = usePrevious(gameId);
  useEffect(() => {
    if (!gameId || gameId === prevGameId) return;
    connect();
    return disconnect;
  }, [gameId, prevGameId, connect, disconnect]);

  const handleMessage = useCallback(
    ({ data }) => {
      if (!onMessage) return;
      onMessage(camelizeKeys(JSON.parse(data)));
    },
    [onMessage],
  );
  useEventListener(webSocket, "message", handleMessage);

  return {
    connect,
    disconnect,
  };
};

export const useSpotify = ({ requireAuth = false }) => {
  const { setIsRequired } = useContext(SpotifyContext);

  useMountEffect(() => () => setIsRequired(false));
  useEffect(() => setIsRequired(requireAuth), [requireAuth, setIsRequired]);
};
