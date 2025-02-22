import { useCallback, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import MediaQuery from "react-responsive";
import { Link, Navigate } from "react-router";

import LinkIcon from "@mui/icons-material/Link";
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Box,
  Button,
  Stack,
  Typography,
  useTheme,
} from "@mui/joy";

import ButtonFooter from "@/components/common/ButtonFooter";
import View from "@/components/views/View";
import {
  CREDITS_STRICTNESS_VALUES,
  DEFAULT_CREDITS_STRICTNESS,
  DEFAULT_INITIAL_TOKENS,
  DEFAULT_MAX_TOKENS,
  DEFAULT_TIMELINE_LENGTH,
} from "@/constants";
import { dismissAllErrors } from "@/store/errors";
import { createGame } from "@/store/games";
import {
  clearPlaylistSearchResults,
  fetchRecommendedPlaylists,
  searchPlaylists,
  startAuth,
} from "@/store/spotify";
import { SpotifyPlaylist } from "@/types/spotify";
import {
  useAppDispatch,
  useAppSelector,
  useErrorSelector,
  useErrorToast,
  useLoadingSelector,
  usePrevious,
  useSpotify,
} from "@/utils/hooks";

import PlaylistSelector from "./components/PlaylistSelector";
import SettingsForm from "./components/SettingsForm";

const CreateGameView = () => {
  const theme = useTheme();

  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const game = useAppSelector((state) => state.games.game);
  const loadingCreateGame = useLoadingSelector(createGame);
  const { error: errorSpotify } = useErrorSelector(
    fetchRecommendedPlaylists,
    searchPlaylists,
  );
  const loadingSpotify = useLoadingSelector(
    fetchRecommendedPlaylists,
    searchPlaylists,
  );
  const spotifyUser = useAppSelector((state) => state.spotify.user);
  const playlistRecommendations = useAppSelector(
    (state) => state.spotify.playlists.recommendations,
  );
  const playlistSearchResults = useAppSelector(
    (state) => state.spotify.playlists.searchResults,
  );

  const publicPlaylistSearchResults = playlistSearchResults.filter(
    (p) => p.public,
  );

  const [expandPlaylists, setExpandPlaylists] = useState(true);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [initialTokens, setInitialTokens] = useState(DEFAULT_INITIAL_TOKENS);
  const [maxTokens, setMaxTokens] = useState(DEFAULT_MAX_TOKENS);
  const [timelineLength, setTimelineLength] = useState(DEFAULT_TIMELINE_LENGTH);
  const [creditsStrictness, setCreditsStrictness] = useState(
    DEFAULT_CREDITS_STRICTNESS,
  );

  useErrorToast(createGame);

  useSpotify({ requireAuth: true });

  useEffect(() => {
    if (spotifyUser && playlistRecommendations.length === 0) {
      dispatch(fetchRecommendedPlaylists());
    }
  }, [spotifyUser, playlistRecommendations.length, dispatch]);

  const handleCreate = useCallback(() => {
    if (!spotifyUser) return;
    dispatch(
      createGame({
        playlistIds: playlists.map(({ id }) => id),
        spotifyMarket: spotifyUser.country,
        initialTokens,
        maxTokens,
        timelineLength,
        ...CREDITS_STRICTNESS_VALUES[creditsStrictness],
      }),
    );
  }, [
    dispatch,
    playlists,
    spotifyUser,
    initialTokens,
    maxTokens,
    timelineLength,
    creditsStrictness,
  ]);

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

  const playlistsHeader = (
    <FormattedMessage
      id="CreateGameView.playlists.header"
      defaultMessage="Playlists"
    />
  );
  const playlistsSection = spotifyUser ? (
    <PlaylistSelector
      value={playlists}
      onChange={setPlaylists}
      error={errorSpotify}
      loading={loadingSpotify}
      recommendations={playlistRecommendations}
      searchResults={publicPlaylistSearchResults}
      onSearch={(args) => dispatch(searchPlaylists(args))}
      onClearSearchResults={() => dispatch(clearPlaylistSearchResults())}
    />
  ) : (
    <Button
      variant="soft"
      sx={{ alignSelf: "start" }}
      startDecorator={<LinkIcon />}
      onClick={() => dispatch(startAuth())}
    >
      <FormattedMessage
        id="CreateGameView.connectSpotifyAccount"
        defaultMessage="Connect Spotify account"
      />
    </Button>
  );

  const settingsHeader = (
    <FormattedMessage
      id="CreateGameView.settings.header"
      defaultMessage="Advanced settings"
    />
  );
  const settingsSection = (
    <SettingsForm
      initialTokens={initialTokens}
      maxTokens={maxTokens}
      timelineLength={timelineLength}
      creditsStrictness={creditsStrictness}
      onInitialTokensChange={setInitialTokens}
      onMaxTokensChange={setMaxTokens}
      onTimelineLengthChange={setTimelineLength}
      onCreditsStrictnessChange={setCreditsStrictness}
    />
  );

  return (
    <View appBar={{ showTitle: true, showLogout: true }}>
      <Stack
        direction="column"
        justifyContent="space-between"
        spacing={2}
        sx={{
          height: "100%",
          width: "100%",
        }}
      >
        <MediaQuery maxWidth={theme.breakpoints.values.sm}>
          <AccordionGroup
            disableDivider
            size="md"
            sx={{
              "overflow": "hidden",
              "--ListItem-paddingX": "8px",
            }}
          >
            <Accordion
              expanded={expandPlaylists}
              onChange={(_, expanded) => setExpandPlaylists(expanded)}
              sx={{ flexShrink: 1, overflow: "hidden" }}
            >
              <AccordionSummary>{playlistsHeader}</AccordionSummary>
              <AccordionDetails>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: "100%",
                    pt: 1,
                  }}
                >
                  {playlistsSection}
                </Box>
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={!expandPlaylists}
              onChange={(_, expanded) => setExpandPlaylists(!expanded)}
              sx={{ flexShrink: 1, overflow: "hidden" }}
            >
              <AccordionSummary>{settingsHeader}</AccordionSummary>
              <AccordionDetails>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: "100%",
                    pt: 1,
                  }}
                >
                  {settingsSection}
                </Box>
              </AccordionDetails>
            </Accordion>
          </AccordionGroup>
        </MediaQuery>
        <MediaQuery minWidth={theme.breakpoints.values.sm}>
          <Stack direction="row" spacing={2} sx={{ overflow: "hidden" }}>
            <Stack direction="column" spacing={1} sx={{ flex: "1 1 0" }}>
              <Typography level="title-md">{playlistsHeader}</Typography>
              {playlistsSection}
            </Stack>

            <Stack direction="column" spacing={1} sx={{ flex: "1 1 0" }}>
              <Typography level="title-md">{settingsHeader}</Typography>
              {settingsSection}
            </Stack>
          </Stack>
        </MediaQuery>

        <ButtonFooter>
          <Button
            color="neutral"
            variant="soft"
            component={Link}
            to="/"
            onClick={handleDismissErrors}
          >
            <FormattedMessage id="CreateGameView.back" defaultMessage="Back" />
          </Button>
          <Button
            loading={loadingCreateGame}
            disabled={loadingCreateGame || playlists.length === 0}
            onClick={handleCreate}
          >
            <FormattedMessage
              id="CreateGameView.createGame"
              defaultMessage="Create game"
            />
          </Button>
        </ButtonFooter>
      </Stack>
    </View>
  );
};

export default CreateGameView;
