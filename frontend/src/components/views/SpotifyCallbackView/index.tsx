import { useEffect, useMemo } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";

import View from "@/components/views/View";
import { dismissError } from "@/store/errors";
import { completeAuth, startAuth } from "@/store/spotify";
import {
  useAppDispatch,
  useAppSelector,
  useErrorSelector,
  useLoadingSelector,
} from "@/utils/hooks";

import ErrorModal from "./components/ErrorModal";

const SpotifyCallbackView = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.spotify.user);

  const loading = useLoadingSelector(completeAuth);
  const { error } = useErrorSelector(completeAuth);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const rawState = searchParams.get("state");

  const state = useMemo(() => {
    if (!rawState) {
      return {};
    }

    try {
      return JSON.parse(rawState);
    } catch {
      return {};
    }
  }, [rawState]);

  useEffect(() => {
    if (code) {
      dispatch(completeAuth({ code }));
    }
  }, [dispatch, code]);

  const handleRetry = () => {
    dispatch(dismissError({ typePrefix: completeAuth.typePrefix }));
    dispatch(startAuth());
  };

  const handleCancel = () => {
    dispatch(dismissError({ typePrefix: completeAuth.typePrefix }));
    navigate("/", { replace: true });
  };

  if (!code) {
    return <Navigate replace to="/" />;
  }

  if (user) {
    return <Navigate replace to={state.pathname || "/"} />;
  }

  return (
    <View appBar={{ showTitle: true, showLogout: true }} loading={loading}>
      <ErrorModal
        open={error != null}
        error={error}
        onRetry={handleRetry}
        onCancel={handleCancel}
      />
    </View>
  );
};

export default SpotifyCallbackView;
