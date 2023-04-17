import { useDispatch, useSelector } from "react-redux";

import FullscreenContainer from "components/containers/FullscreenContainer";
import RoutingContainer from "components/containers/RoutingContainer";
import SpotifyContainer from "components/containers/SpotifyContainer";
import {
  fetchCurrentUser as fetchCurrentApiUser,
  invalidateSession,
} from "store/auth/actions";
import {
  fetchCurrentUser as fetchCurrentSpotifyUser,
  invalidateAccessToken,
} from "store/spotify/actions";
import { useMountEffect } from "utils/hooks";

const RootContainer = () => {
  const dispatch = useDispatch();
  const apiSessionToken = useSelector((state) => state.auth.sessionToken);
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

  return (
    <FullscreenContainer>
      <SpotifyContainer>
        <RoutingContainer />
      </SpotifyContainer>
    </FullscreenContainer>
  );
};

export default RootContainer;