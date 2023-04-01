import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import LinkIcon from "@mui/icons-material/Link";
import { Button, Stack, Typography } from "@mui/joy";

import View from "components/views/View";
import { createGame } from "store/games/actions";
import {
  fetchRecommendedPlaylists,
  searchPlaylists,
  startAuth,
} from "store/spotify/actions";
import { usePrevious } from "utils/hooks";

import PlaylistSelector from "./components/PlaylistSelector";

const CreateGameView = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const game = useSelector((state) => state.games.game);
  const spotifyUser = useSelector((state) => state.spotify.user);
  const playlistRecommendations = useSelector(
    (state) => state.spotify.playlists.recommendations,
  );
  const playlistSearchResults = useSelector(
    (state) => state.spotify.playlists.searchResults,
  );

  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    if (spotifyUser && playlistRecommendations.length === 0) {
      dispatch(fetchRecommendedPlaylists());
    }
  }, [spotifyUser, playlistRecommendations, dispatch]);

  const handleStartSpotifyAuth = () => {
    dispatch(startAuth());
  };

  const handleSearchPlaylists = ({ query, limit }) => {
    dispatch(searchPlaylists({ query, limit }));
  };

  const handleCreate = () => {
    dispatch(
      createGame({
        playlistIds: playlists.map(({ id }) => id),
        spotifyMarket: spotifyUser.country,
      }),
    );
  };

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

        <Button disabled={playlists.length === 0} onClick={handleCreate}>
          <FormattedMessage
            id="CreateGameView.createGame"
            defaultMessage="Create game"
          />
        </Button>
      </Stack>
    </View>
  );
};

export default CreateGameView;
