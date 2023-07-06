import { useCallback, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";

import LinkIcon from "@mui/icons-material/Link";
import { Button, Stack, Typography } from "@mui/joy";

import View from "components/views/View";
import { dismissAllErrors } from "store/errors/actions";
import { createGame } from "store/games/actions";
import {
  fetchRecommendedPlaylists,
  searchPlaylists,
  startAuth,
} from "store/spotify/actions";
import {
  useErrorSelector,
  useErrorToast,
  useLoadingSelector,
  usePrevious,
  useSpotify,
} from "utils/hooks";

import PlaylistSelector from "./components/PlaylistSelector";

const CreateGameView = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const game = useSelector((state) => state.games.game);
  const loadingCreateGame = useLoadingSelector(createGame);
  const errorSpotify = useErrorSelector(
    fetchRecommendedPlaylists,
    searchPlaylists,
  );
  const loadingSpotify = useLoadingSelector(
    fetchRecommendedPlaylists,
    searchPlaylists,
  );
  const spotifyUser = useSelector((state) => state.spotify.user);
  const playlistRecommendations = useSelector(
    (state) => state.spotify.playlists.recommendations,
  );
  const playlistSearchResults = useSelector(
    (state) => state.spotify.playlists.searchResults,
  );

  const [playlists, setPlaylists] = useState([]);

  useErrorToast(createGame);

  useSpotify({ requireAuth: true });

  useEffect(() => {
    if (spotifyUser && playlistRecommendations.length === 0) {
      dispatch(fetchRecommendedPlaylists());
    }
  }, [spotifyUser, playlistRecommendations, dispatch]);

  const handleStartSpotifyAuth = useCallback(
    () => dispatch(startAuth()),
    [dispatch],
  );

  const handleSearchPlaylists = useCallback(
    ({ query, limit }) => dispatch(searchPlaylists({ query, limit })),
    [dispatch],
  );

  const handleCreate = useCallback(() => {
    dispatch(
      createGame({
        playlistIds: playlists.map(({ id }) => id),
        spotifyMarket: spotifyUser.country,
      }),
    );
  }, [dispatch, playlists, spotifyUser]);

  const handleDismissErrors = useCallback(
    () => dispatch(dismissAllErrors()),
    [dispatch],
  );

  const prevGame = usePrevious(game);
  if (game && game !== prevGame) {
    return <Navigate to={`/games/${game.id}`} />;
  }

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  return (
    <View appBar={{ showTitle: true, showLogout: true }}>
      <Stack
        direction="column"
        justifyContent="space-between"
        spacing={2}
        sx={{ overflow: "hidden" }}
      >
        <Stack direction="column" spacing={1} sx={{ overflow: "hidden" }}>
          <Typography level="h6">
            <FormattedMessage
              id="CreateGameView.playlists.header"
              defaultMessage="Playlists"
            />
          </Typography>
          {spotifyUser ? (
            <PlaylistSelector
              value={playlists}
              onChange={setPlaylists}
              error={errorSpotify}
              loading={loadingSpotify}
              recommendations={playlistRecommendations}
              searchResults={playlistSearchResults}
              onSearch={handleSearchPlaylists}
            />
          ) : (
            <Button
              variant="soft"
              sx={{ alignSelf: "start" }}
              startDecorator={<LinkIcon />}
              onClick={handleStartSpotifyAuth}
            >
              <FormattedMessage
                id="CreateGameView.connectSpotifyAccount"
                defaultMessage="Connect Spotify account"
              />
            </Button>
          )}
        </Stack>

        <Stack direction="row" spacing={2}>
          <Button
            fullWidth
            color="neutral"
            variant="soft"
            component={Link}
            to="/"
            onClick={handleDismissErrors}
          >
            <FormattedMessage id="CreateGameView.back" defaultMessage="Back" />
          </Button>
          <Button
            fullWidth
            loading={loadingCreateGame}
            disabled={loadingCreateGame || playlists.length === 0}
            onClick={handleCreate}
          >
            <FormattedMessage
              id="CreateGameView.createGame"
              defaultMessage="Create game"
            />
          </Button>
        </Stack>
      </Stack>
    </View>
  );
};

export default CreateGameView;
