import { FormattedMessage } from "react-intl";
import QRCode from "react-qr-code";
import { useDispatch, useSelector } from "react-redux";

import { Box, Button, Typography } from "@mui/joy";

import View from "components/views/View";
import { MIN_PLAYER_COUNT } from "constants";
import { abortGame, leaveGame, startGame } from "store/games/actions";

import PlayersList from "./components/PlayersList";
import ShareLinkButton from "./components/ShareJoinLinkButton";

const GameLobbyView = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const game = useSelector((state) => state.games.game);
  const users = useSelector((state) => state.games.users);

  const gameId = game.id;
  const userId = user.id;
  const gameMasterId = game.players.find((p) => p.isGameMaster)?.userId;
  const joinUrl = `${document.location.origin}/games/join/${gameId}`;

  return (
    <View appBar={{ showTitle: true, showLogout: true }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <QRCode value={joinUrl} />
            <ShareLinkButton
              fullWidth
              variant="soft"
              color="neutral"
              sx={{ mt: 1 }}
              url={joinUrl}
            />
          </Box>

          <Box>
            <Typography level="h6">
              <FormattedMessage
                id="GameLobbyView.players.header"
                defaultMessage="Players"
              />
            </Typography>
            <PlayersList
              users={users}
              currentUserId={user?.id}
              gameMasterId={gameMasterId}
            />
          </Box>
        </Box>

        <Box>
          {user?.id === gameMasterId ? (
            <>
              <Button
                fullWidth
                color="danger"
                sx={{ mb: 2 }}
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
        </Box>
      </Box>
    </View>
  );
};

export default GameLobbyView;
