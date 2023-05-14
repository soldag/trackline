import { camelizeKeys } from "humps";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

import api from "api/trackline";
import SpotifyContext from "components/contexts/SpotifyContext";
import { dismissError } from "store/common/actions";
import { getErrorMessage } from "utils/errors";

export const useMountEffect = (effect) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useEffect(effect, []);
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

export const useErrorToast = ({ error }) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const prevError = usePrevious(error);
  useEffect(() => {
    if (!error || error === prevError) return;

    const message = getErrorMessage(intl, error);
    toast.error(message, {
      onDismiss: () => dispatch(dismissError()),
      onAutoClose: () => dispatch(dismissError()),
    });
  }, [prevError, error, intl, dispatch]);
};
