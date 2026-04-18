import { useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { useParams } from "react-router";

import { Box, Stack, Typography } from "@mui/joy";

import AppNavigate from "@/components/common/AppNavigate";
import View from "@/components/views/View";
import { joinGame } from "@/store/games";
import {
  useAppDispatch,
  useAppNavigate,
  useAppSelector,
  useErrorToast,
  useLoadingSelector,
} from "@/utils/hooks";

import JoinGameForm, { FormValues } from "./components/JoinGameForm";
import QrCodeScanner from "./components/QrCodeScanner";

const JoinGameView = () => {
  const { joinCode } = useParams();
  const navigate = useAppNavigate();

  const dispatch = useAppDispatch();
  const game = useAppSelector((state) => state.games.game);

  const loadingJoinGame = useLoadingSelector(joinGame);
  useErrorToast(joinGame);

  const handleJoin = ({ joinCode }: FormValues) => {
    navigate(`/games/join/${joinCode}`, { replace: true });
  };

  useEffect(() => {
    if (joinCode) {
      dispatch(joinGame({ joinCode }));
    }
  }, [dispatch, joinCode]);

  if (game && game.joinCode === joinCode) {
    return <AppNavigate replace to={`/games/${game.id}`} />;
  }

  return (
    <View
      appBar={{
        title: (
          <FormattedMessage
            id="JoinGameView.title"
            defaultMessage="Join existing game"
          />
        ),
        showBack: true,
        showLogout: true,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems="stretch"
        spacing={2}
      >
        <Stack direction="column" spacing={1} sx={{ flex: "1 1 0" }}>
          <Typography level="title-md">
            <FormattedMessage
              id="JoinGameView.scanQrCode.header"
              defaultMessage="Scan QR code"
            />
          </Typography>
          <Box sx={{ flex: "1 1 0", overflow: "hidden" }}>
            {!joinCode && (
              <QrCodeScanner
                sx={{ margin: { xs: "0 auto", sm: "0" } }}
                onResult={handleJoin}
              />
            )}
          </Box>
        </Stack>

        <Stack direction="column" spacing={1}>
          <Typography level="title-md">
            <FormattedMessage
              id="JoinGameView.enterGameId.header"
              defaultMessage="Enter game ID manually"
            />
          </Typography>
          <JoinGameForm loading={loadingJoinGame} onSubmit={handleJoin} />
        </Stack>
      </Stack>
    </View>
  );
};

export default JoinGameView;
