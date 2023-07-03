import { useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { Box, Stack, Typography } from "@mui/joy";

import View from "components/views/View";
import { dismissError } from "store/errors/actions";
import { joinGame } from "store/games/actions";

import JoinGameForm from "./components/JoinGameForm";
import QrScanner from "./components/QrScanner";

const JoinGameView = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const game = useSelector((state) => state.games.game);

  const handleJoin = ({ gameId }) => {
    navigate(`/games/join/${gameId}`, { replace: true });
  };

  const handleDismissError = () => {
    dispatch(dismissError(joinGame));
  };

  useEffect(() => {
    if (gameId) {
      dispatch(joinGame({ gameId }));
    }
  }, [dispatch, gameId]);

  if (game && game.id === gameId) {
    return <Navigate to={`/games/${game.id}`} />;
  }

  return (
    <View appBar={{ showTitle: true, showLogout: true }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems="stretch"
        spacing={2}
      >
        <Stack direction="column" spacing={1} sx={{ flex: "1 1 0" }}>
          <Typography level="h6">
            <FormattedMessage
              id="JoinGameView.scanQrCode.header"
              defaultMessage="Scan QR code"
            />
          </Typography>
          <Box sx={{ flex: "1 1 0", overflow: "hidden" }}>
            {!gameId && (
              <QrScanner
                sx={{ margin: { xs: "0 auto", sm: "0" } }}
                onResult={handleJoin}
              />
            )}
          </Box>
        </Stack>

        <Stack direction="column" spacing={1}>
          <Typography level="h6">
            <FormattedMessage
              id="JoinGameView.enterGameId.header"
              defaultMessage="Enter game ID manually"
            />
          </Typography>
          <JoinGameForm
            onSubmit={handleJoin}
            onDismissError={handleDismissError}
          />
        </Stack>
      </Stack>
    </View>
  );
};

export default JoinGameView;
