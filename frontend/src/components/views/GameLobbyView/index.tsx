import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { Navigate } from "react-router";

import { Box, Button, Stack, Typography } from "@mui/joy";

import ButtonFooter from "@/components/common/ButtonFooter";
import ResponsiveQrCode from "@/components/common/ResponsiveQrCode";
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

import PlayersList from "./components/PlayersList";
import QrCodeModal from "./components/QrCodeModal";
import ShareLinkButton from "./components/ShareJoinLinkButton";

const GameLobbyView = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const game = useAppSelector((state) => state.games.game);
  const users = useAppSelector((state) => state.games.users);

  const loadingStartGame = useLoadingSelector(startGame);
  const loadingAbortGame = useLoadingSelector(abortGame);
  const loadingLeaveGame = useLoadingSelector(leaveGame);
  useErrorToast(startGame, abortGame, leaveGame);

  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);

  const gameId = game?.id;
  const userId = user?.id;
  const gameMasterId = game?.players.find((p) => p.isGameMaster)?.userId;
  const isGameMaster = user?.id === gameMasterId;
  const joinUrl = `${document.location.origin}/games/join/${gameId}`;

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
        showTitle: true,
        showPlaybackControls: true,
        showExitGame: true,
      }}
    >
      <QrCodeModal
        joinUrl={joinUrl}
        open={qrCodeModalOpen}
        onClose={() => setQrCodeModalOpen(false)}
      />

      <Stack
        direction="column"
        justifyContent="space-between"
        spacing={2}
        sx={{ overflow: "hidden" }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ overflow: "hidden" }}
        >
          <Stack direction="column" spacing={1} sx={{ flex: { sm: "1 1 0" } }}>
            <Typography level="title-md">
              <FormattedMessage
                id="GameLobbyView.invitePlayers.header"
                defaultMessage="Invite players"
              />
            </Typography>
            <Box sx={{ overflow: "hidden" }}>
              <ResponsiveQrCode
                sx={{
                  maxWidth: {
                    xs: "128px",
                    sm: "256px",
                    md: "512px",
                  },
                }}
                data={joinUrl}
                onClick={() => setQrCodeModalOpen(true)}
              />
            </Box>
            <ShareLinkButton variant="soft" color="neutral" url={joinUrl} />
          </Stack>

          <Stack
            direction="column"
            spacing={1}
            sx={{ flex: { sm: "1 1 0" }, overflow: "hidden" }}
          >
            <Typography level="title-md">
              <FormattedMessage
                id="GameLobbyView.joinedPlayers.header"
                defaultMessage="Joined players"
              />
            </Typography>
            <Box sx={{ overflowY: "auto" }}>
              <PlayersList
                users={users}
                currentUserId={user?.id}
                gameMasterId={gameMasterId}
              />
            </Box>
          </Stack>
        </Stack>

        {isGameMaster ? (
          <ButtonFooter>
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
          </ButtonFooter>
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
    </View>
  );
};

export default GameLobbyView;
