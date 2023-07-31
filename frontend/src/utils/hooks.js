import { camelizeKeys } from "humps";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import api from "~/api/trackline";
import SpotifyContext from "~/components/contexts/SpotifyContext";
import { dismissError } from "~/store/errors/actions";
import { getErrorMessage } from "~/utils/errors";
import { getRoutinePrefix } from "~/utils/routines";

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

export const useEventListener = (target, type, listener, options) => {
  const savedListener = useRef(listener);

  useEffect(() => {
    savedListener.current = listener;
  }, [listener]);

  useEffect(() => {
    if (!target) return;

    const listener = (e) => savedListener.current(e);
    target.addEventListener(type, listener, options);
    return () => target.removeEventListener(type, listener, options);
  });
};

export const useInterval = (callback, delay) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!delay && delay !== 0) return;

    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
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
