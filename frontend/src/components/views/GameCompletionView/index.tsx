import { FormattedMessage } from "react-intl";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button, Stack } from "@mui/joy";

import AppLink from "@/components/common/AppLink";
import GameScoringTable from "@/components/common/GameScoringTable";
import ScoringSection from "@/components/views/GameTurnScoringView/components/ScoringSection";
import View from "@/components/views/View";
import { GAME_COMPLETION_TRACK_ID } from "@/constants";
import { useConfetti, useFireworks } from "@/utils/confetti";
import {
  useAppSelector,
  useMountEffect,
  useSpotifyPlayback,
} from "@/utils/hooks";

import Podium from "./components/Podium";
import WinnerHeader from "./components/WinnerHeader";

const GameCompletionView = () => {
  const { start: startFireworks } = useFireworks({ duration: 60 * 1000 });
  const { start: startConfetti } = useConfetti();

  const user = useAppSelector((state) => state.auth.user);
  const game = useAppSelector((state) => state.games.game);
  const users = useAppSelector((state) => state.games.users);

  const currentPlayer = game?.players.find((p) => p.userId === user?.id);
  const { isGameMaster = false } = currentPlayer || {};

  useMountEffect(() => {
    startConfetti();
    startFireworks();
  });

  useSpotifyPlayback({
    isEnabled: isGameMaster,
    trackId: GAME_COMPLETION_TRACK_ID,
  });

  return (
    <View
      appBar={{ showPlayerInfo: true, showLogout: true }}
      footer={
        <Button
          fullWidth
          variant="solid"
          color="primary"
          startDecorator={<ArrowBackIcon />}
          component={AppLink}
          to="/"
        >
          <FormattedMessage
            id="GameCompletionView.mainMenu"
            defaultMessage="Back to main menu"
          />
        </Button>
      }
    >
      <Stack spacing={6} justifyContent="center" sx={{ flexGrow: 1 }}>
        <WinnerHeader
          players={game?.players ?? []}
          users={users}
          currentUserId={user?.id}
        />

        <Podium players={game?.players ?? []} users={users} />

        <ScoringSection
          header={
            <FormattedMessage
              id="GameCompletionView.finalStandings.header"
              defaultMessage="Final standings"
            />
          }
        >
          <GameScoringTable showRank players={game?.players} users={users} />
        </ScoringSection>
      </Stack>
    </View>
  );
};

export default GameCompletionView;
