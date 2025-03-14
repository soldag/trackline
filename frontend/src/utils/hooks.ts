import {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { useIntl } from "react-intl";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";
import { toast } from "sonner";

import { useTheme } from "@mui/joy";
import { Breakpoints } from "@mui/system";

import SpotifyContext from "@/components/contexts/SpotifyContext";
import { dismissError } from "@/store/errors/actions";
import { AppError } from "@/types/errors";
import { AnyAsyncThunk, AppDispatch, RootState } from "@/types/store";
import { getErrorMessage } from "@/utils/errors";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export const useMountEffect = (effect: React.EffectCallback) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useEffect(effect, []);
};

export const useUnmountEffect = (effect: () => void) => {
  const ref = useRef(effect);

  useEffect(() => {
    ref.current = effect;
  }, [effect]);

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

export const usePrevious = <T>(value: T): T | null => {
  const ref = useRef<T>(null);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

export const useUpdatingRef = <T>(value: T): React.MutableRefObject<T> => {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
};

export const useEventListener = <EventType extends Event = Event>(
  target: EventTarget | null,
  type: string,
  listener: (event: EventType) => void,
) => {
  const savedListener = useUpdatingRef(listener);

  useEffect(() => {
    if (!target) return;

    const listener = (e: Event) => savedListener.current(e as EventType);
    target.addEventListener(type, listener);
    return () => target.removeEventListener(type, listener);
  }, [target, type, savedListener]);
};

export const useInterval = (
  callback: () => void,
  delay: number,
  { autoStart = true }: { autoStart?: boolean } = {},
) => {
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

export const useCountdown = ({
  start,
  end,
  updateInterval = 100,
}: {
  start?: number;
  end?: number;
  updateInterval?: number;
}) => {
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

export const useErrorSelector = (
  ...thunks: AnyAsyncThunk[]
): { typePrefix?: string; error?: AppError } => {
  const typePrefixes = thunks.map((a) => a.typePrefix);
  const typePrefix = useAppSelector((state) =>
    typePrefixes.find((p) => state.errors.byThunk[p]),
  );
  const error = useAppSelector((state) =>
    typePrefix ? state.errors.byThunk[typePrefix] : undefined,
  );

  return { typePrefix, error };
};

export const useBreakpoint = (
  querySelector: (breakpoints: Breakpoints) => string,
) => {
  const theme = useTheme();
  const query = querySelector(theme.breakpoints).replace("@media", "");
  return useMediaQuery({ query });
};

export const useLoadingSelector = (...thunks: AnyAsyncThunk[]): boolean => {
  const typePrefixes = thunks.map((a) => a.typePrefix);
  return useAppSelector((state) =>
    typePrefixes.some((typePrefix) => state.loading.byThunk[typePrefix]),
  );
};

export const useErrorToast = (...thunks: AnyAsyncThunk[]) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const { typePrefix, error } = useErrorSelector(...thunks);

  const prevError = usePrevious(error);
  useEffect(() => {
    if (!typePrefix || !error || error === prevError) return;

    const message = getErrorMessage(intl, error);
    toast.error(message, {
      onDismiss: () => dispatch(dismissError({ typePrefix })),
      onAutoClose: () => dispatch(dismissError({ typePrefix })),
    });
  }, [prevError, error, typePrefix, intl, dispatch]);
};

export const useSpotify = ({
  requireAuth = false,
}: {
  requireAuth?: boolean;
}) => {
  const { setIsRequired } = useContext(SpotifyContext);

  useMountEffect(() => () => setIsRequired(false));
  useEffect(() => setIsRequired(requireAuth), [requireAuth, setIsRequired]);
};
