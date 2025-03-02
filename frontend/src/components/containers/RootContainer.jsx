import { useDispatch, useSelector } from "react-redux";

import RoutingContainer from "@/components/containers/RoutingContainer";
import SpotifyContainer from "@/components/containers/SpotifyContainer";
import LoadingView from "@/components/views/LoadingView";
import {
  fetchCurrentUser as fetchCurrentApiUser,
  invalidateSession,
} from "@/store/auth";
import {
  fetchCurrentUser as fetchCurrentSpotifyUser,
  invalidateAccessToken,
} from "@/store/spotify";
import { useMountEffect } from "@/utils/hooks";

const RootContainer = () => {
  const dispatch = useDispatch();
  const apiIsLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const apiSessionToken = useSelector((state) => state.auth.sessionToken);
  const spotifyIsLoggedIn = useSelector((state) => state.spotify.isLoggedIn);
  const spotifyAccessToken = useSelector((state) => state.spotify.accessToken);

  useMountEffect(() => {
    if (apiSessionToken) {
      dispatch(fetchCurrentApiUser());
    } else {
      dispatch(invalidateSession());
    }

    if (spotifyAccessToken) {
      dispatch(fetchCurrentSpotifyUser());
    } else {
      dispatch(invalidateAccessToken());
    }
  });

  if (apiIsLoggedIn == null || spotifyIsLoggedIn == null) {
    return <LoadingView />;
  }

  return (
    <SpotifyContainer>
      <RoutingContainer />
    </SpotifyContainer>
  );
};

export default RootContainer;
