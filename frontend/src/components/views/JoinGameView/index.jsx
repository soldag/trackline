import { useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";

import View from "components/views/View";
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
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography level="h6" sx={{ mb: 1 }}>
            <FormattedMessage
              id="JoinGameView.scanQrCode.header"
              defaultMessage="Scan QR code"
            />
          </Typography>
          {!gameId && <QrScanner onResult={handleJoin} />}
        </Box>

        <Typography
          level="h5"
          textAlign="center"
          sx={{
            ":before, :after": {
              content: "'–'",
              mx: "10px",
            },
            "textTransform": "uppercase",
          }}
        >
          <FormattedMessage
            id="JoinGameView.orSeparator.header"
            defaultMessage="or"
          />
        </Typography>

        <Box>
          <Typography level="h6" sx={{ mb: 1 }}>
            <FormattedMessage
              id="JoinGameView.enterGameId.header"
              defaultMessage="Enter game ID manually"
            />
          </Typography>
          <JoinGameForm onSubmit={handleJoin} />
        </Box>
      </Box>
    </View>
  );
};

export default JoinGameView;
