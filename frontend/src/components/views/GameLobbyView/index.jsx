import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { Box, Button, Stack, Typography } from "@mui/joy";

import ResponsiveQrCode from "components/common/ResponsiveQrCode";
import View from "components/views/View";
import { MIN_PLAYER_COUNT } from "constants";
import { abortGame, leaveGame, startGame } from "store/games/actions";

import PlayersList from "./components/PlayersList";
import QrCodeModal from "./components/QrCodeModal";
import ShareLinkButton from "./components/ShareJoinLinkButton";

const GameLobbyView = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const game = useSelector((state) => state.games.game);
  const users = useSelector((state) => state.games.users);

  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);

  const gameId = game.id;
  const userId = user.id;
  const gameMasterId = game.players.find((p) => p.isGameMaster)?.userId;
  const joinUrl = `${document.location.origin}/games/join/${gameId}`;

  return (
    <View appBar={{ showTitle: true, showLogout: true }}>
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
            <Typography level="h6">
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
            <Typography level="h6">
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

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          {user?.id === gameMasterId ? (
            <>
              <Button
                fullWidth
                color="danger"
                onClick={() => dispatch(abortGame({ gameId }))}
              >
                <FormattedMessage
                  id="GameLobbyView.abortGame"
                  defaultMessage="Abort game"
                />
              </Button>
              <Button
                fullWidth
                disabled={game.players.length < MIN_PLAYER_COUNT}
                onClick={() => dispatch(startGame({ gameId }))}
              >
                <FormattedMessage
                  id="GameLobbyView.startGame"
                  defaultMessage="Start game"
                />
              </Button>
            </>
          ) : (
            <Button
              fullWidth
              color="danger"
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
