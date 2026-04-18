import { FormattedMessage } from "react-intl";
import { Navigate } from "react-router";

import EmailIcon from "@mui/icons-material/Email";
import PeopleIcon from "@mui/icons-material/People";
import { Box, Button, Divider, Stack, Typography } from "@mui/joy";

import View from "@/components/views/View";
import { LOBBY_TRACK_ID, MIN_PLAYER_COUNT } from "@/constants";
import { abortGame, leaveGame, startGame } from "@/store/games";
import {
  useAppDispatch,
  useAppSelector,
  useErrorToast,
  useLoadingSelector,
  useSpotifyPlayback,
} from "@/utils/hooks";

import JoinGameCard from "./components/JoinGameCard";
import PlayersList from "./components/PlayersList";

const GameLobbyView = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const game = useAppSelector((state) => state.games.game);
  const users = useAppSelector((state) => state.games.users);

  const loadingStartGame = useLoadingSelector(startGame);
  const loadingAbortGame = useLoadingSelector(abortGame);
  const loadingLeaveGame = useLoadingSelector(leaveGame);
  useErrorToast(startGame, abortGame, leaveGame);

  const gameId = game?.id;
  const userId = user?.id;
  const gameMasterId = game?.players.find((p) => p.isGameMaster)?.userId;
  const isGameMaster = user?.id === gameMasterId;
  const sortedUsers =
    game?.players
      .map((p) => users.find((u) => u.id === p.userId))
      .filter((u) => !!u) ?? [];

  useSpotifyPlayback({
    isEnabled: isGameMaster,
    trackId: LOBBY_TRACK_ID,
  });

  if (!gameId || !userId) {
    return <Navigate replace to="/" />;
  }

  return (
    <View
      appBar={{
        title: (
          <FormattedMessage
            id="GameLobbyView.title"
            defaultMessage="Waiting for players"
          />
        ),
        showBack: true,
        showPlaybackControls: true,
        showExitGame: true,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={4}
        sx={{ overflow: "hidden" }}
      >
        <Stack direction="column" spacing={2} sx={{ flex: { sm: "1 1 0" } }}>
          <Stack spacing={1}>
            <Typography
              level="title-md"
              startDecorator={<EmailIcon color="primary" />}
            >
              <FormattedMessage
                id="GameLobbyView.invitePlayers.header"
                defaultMessage="Invite players"
              />
            </Typography>
            <Typography level="body-sm">
              <FormattedMessage
                id="GameLobbyView.invitePlayers.description"
                defaultMessage="Share the code or link so others can join."
              />
            </Typography>
          </Stack>

          <JoinGameCard joinCode={game.joinCode} />
        </Stack>

        <Divider
          orientation="vertical"
          sx={{ display: { xs: "none", sm: "initial" } }}
        />

        <Stack
          direction="column"
          spacing={2}
          sx={{ flex: "1 1 0", overflow: "hidden" }}
        >
          <Stack spacing={1}>
            <Typography
              level="title-md"
              startDecorator={<PeopleIcon color="primary" />}
            >
              <FormattedMessage
                id="GameLobbyView.joinedPlayers.header"
                defaultMessage="Joined players"
              />
            </Typography>
            <Typography level="body-sm">
              {game.players.length < MIN_PLAYER_COUNT ? (
                <FormattedMessage
                  id="GameLobbyView.joinedPlayers.waitingForPlayers"
                  defaultMessage="You need at least two players to start."
                />
              ) : (
                <FormattedMessage
                  id="GameLobbyView.joinedPlayers.description.readyToStart"
                  defaultMessage="You can start now, or wait for more players."
                />
              )}
            </Typography>
          </Stack>

          <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
            <PlayersList users={sortedUsers} gameMasterId={gameMasterId} />
          </Box>

          {isGameMaster ? (
            <Stack spacing={2}>
              <Button
                loading={loadingStartGame}
                disabled={
                  loadingStartGame || game.players.length < MIN_PLAYER_COUNT
                }
                onClick={() => dispatch(startGame({ gameId }))}
              >
                <FormattedMessage
                  id="GameLobbyView.startGame"
                  defaultMessage="Start game"
                />
              </Button>
              <Button
                color="danger"
                loading={loadingAbortGame}
                onClick={() => dispatch(abortGame({ gameId }))}
              >
                <FormattedMessage
                  id="GameLobbyView.abortGame"
                  defaultMessage="Abort game"
                />
              </Button>
            </Stack>
          ) : (
            <Button
              fullWidth
              color="danger"
              loading={loadingLeaveGame}
              onClick={() => dispatch(leaveGame({ gameId, userId }))}
            >
              <FormattedMessage
                id="GameLobbyView.leaveGame"
                defaultMessage="Leave game"
              />
            </Button>
          )}
        </Stack>
      </Stack>
    </View>
  );
};

export default GameLobbyView;
