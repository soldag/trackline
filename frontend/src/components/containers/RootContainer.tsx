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
import { useAppDispatch, useAppSelector, useMountEffect } from "@/utils/hooks";

const RootContainer = () => {
  const dispatch = useAppDispatch();
  const apiIsLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const apiSessionToken = useAppSelector((state) => state.auth.sessionToken);
  const spotifyIsLoggedIn = useAppSelector((state) => state.spotify.isLoggedIn);
  const spotifyAccessToken = useAppSelector(
    (state) => state.spotify.accessToken,
  );

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
