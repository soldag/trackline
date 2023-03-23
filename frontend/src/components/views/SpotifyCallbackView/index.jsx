import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useSearchParams } from "react-router-dom";

import View from "components/views/View";
import { completeAuth } from "store/spotify/actions";

const SpotifyCallbackView = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.spotify.user);

  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const rawState = searchParams.get("state");

  const state = useMemo(() => {
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

  if (!code || user) {
    return <Navigate replace to={state.pathname || "/"} />;
  }

  return <View appBar={{ showTitle: true, showLogout: true }} loading />;
};

export default SpotifyCallbackView;
