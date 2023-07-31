import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { Button, Stack } from "@mui/joy";

import TrackCard from "~/components/common/TrackCard";
import BuyTrackModal from "~/components/views/GameTurnScoringView/components/BuyTrackModal";
import View from "~/components/views/View";
import { TOKEN_COST_BUY_TRACK } from "~/constants";
import { buyTrack, completeTurn } from "~/store/games/actions";
import { useConfetti, useStars } from "~/utils/confetti";
import { useErrorToast, useLoadingSelector } from "~/utils/hooks";

import ScoringTabs from "./components/ScoringTabs";

const GameTurnScoringView = () => {
  const [buyTrackModalOpen, setBuyTrackModelOpen] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const game = useSelector((state) => state.games.game);
  const users = useSelector((state) => state.games.users);

  const loadingBuyTrack = useLoadingSelector(buyTrack);
  const loadingCompleteTurn = useLoadingSelector(completeTurn);
  useErrorToast(buyTrack, completeTurn);

  const userId = user.id;
  const gameId = game.id;
  const turnId = game.turns.length - 1;
  const turn = game.turns[turnId];
  const currentPlayer = game.players.find((p) => p.userId === user?.id);
  const { isGameMaster = false } = currentPlayer || {};
  const hasCompletedTurn = turn.completedBy.includes(userId);
  const canBuyTrack =
    !hasCompletedTurn && currentPlayer?.tokens >= TOKEN_COST_BUY_TRACK;
  const isPositionWinner = turn?.scoring?.position?.winner === userId;
  const isReleaseYearWinner = turn?.scoring?.releaseYear?.winner === userId;

  const { start: startStars } = useStars();
  const { start: startConfetti } = useConfetti();

  useEffect(() => {
    if (isPositionWinner) {
      startStars();
    } else if (isReleaseYearWinner) {
      startConfetti();
    }
  }, [isPositionWinner, isReleaseYearWinner, startStars, startConfetti]);

  return (
    <View
      appBar={{
        showPlayerInfo: true,
        showPlaybackControls: isGameMaster,
        showExitGame: true,
      }}
    >
      <BuyTrackModal
        open={buyTrackModalOpen}
        onConfirm={() => dispatch(buyTrack({ gameId, userId }))}
        onClose={() => setBuyTrackModelOpen(false)}
      />

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
        sx={{
          height: "100%",
          width: "100%",
        }}
      >
        <Stack spacing={2} justifyContent="space-between">
          <TrackCard sx={{ alignSelf: "center" }} track={turn.track} />

          <Stack direction="row" spacing={1}>
            <Button
              variant="soft"
              color="neutral"
              loading={loadingBuyTrack}
              disabled={loadingBuyTrack || !canBuyTrack}
              onClick={() => setBuyTrackModelOpen(true)}
            >
              <AddShoppingCartIcon />
            </Button>

            <Button
              variant="soft"
              sx={{ flexGrow: 1 }}
              loading={loadingCompleteTurn}
              disabled={loadingCompleteTurn || hasCompletedTurn}
              onClick={() => dispatch(completeTurn({ gameId, turnId }))}
            >
              {hasCompletedTurn ? (
                <FormattedMessage
                  id="GameTurnScoringView.waitingForPlayers"
                  defaultMessage="Waiting for players..."
                />
              ) : (
                <FormattedMessage
                  id="GameTurnScoringView.continue"
                  defaultMessage="Continue"
                />
              )}
            </Button>
          </Stack>
        </Stack>

        <ScoringTabs turn={turn} players={game.players} users={users} />
      </Stack>
    </View>
  );
};

export default GameTurnScoringView;
