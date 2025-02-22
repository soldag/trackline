import * as _ from "lodash-es";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router";

import { Box, Button, Stack } from "@mui/joy";

import GameScoringTable from "@/components/common/GameScoringTable";
import View from "@/components/views/View";
import { GAME_COMPLETION_TRACK_ID } from "@/constants";
import { play } from "@/store/spotify";
import { useFireworks } from "@/utils/confetti";
import { useAppDispatch, useAppSelector, useMountEffect } from "@/utils/hooks";

import WinnerTrophy from "./components/WinnerTrophy";

const GameCompletionView = () => {
  const { start: startFireworks } = useFireworks({ duration: 60 * 1000 });

  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const game = useAppSelector((state) => state.games.game);
  const users = useAppSelector((state) => state.games.users);

  const currentPlayer = game?.players.find((p) => p.userId === user?.id);
  const { isGameMaster = false } = currentPlayer || {};

  const winnerPlayer = _.maxBy(game?.players, (p) => p.timeline.length);
  const winnerUser = users.find((u) => u.id === winnerPlayer?.userId);

  useMountEffect(() => {
    startFireworks();

    if (isGameMaster) {
      dispatch(play({ trackId: GAME_COMPLETION_TRACK_ID }));
    }
  });

  return (
    <View appBar={{ showPlayerInfo: true, showLogout: true }}>
      <Stack
        direction="column"
        justifyContent="space-between"
        spacing={2}
        sx={{
          height: "100%",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexGrow: 1,
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            alignItems={{
              xs: "center",
              sm: "start",
            }}
            spacing={2}
          >
            <WinnerTrophy username={winnerUser?.username} />
            <GameScoringTable players={game?.players} users={users} />
          </Stack>
        </Box>

        <Button fullWidth component={Link} to="/">
          <FormattedMessage
            id="GameCompletionView.mainMenu"
            defaultMessage="Back to main menu"
          />
        </Button>
      </Stack>
    </View>
  );
};

export default GameCompletionView;
