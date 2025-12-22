import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import { Button, Stack } from "@mui/joy";

import TrackCard from "@/components/common/TrackCard";
import BuyTrackReminderModal from "@/components/views/GameTurnScoringView/components/BuyTrackReminderModal";
import View from "@/components/views/View";
import { TOKEN_COST_BUY_TRACK } from "@/constants";
import {
  buyTrack,
  clearBoughtTrack,
  completeTurn,
  proposeCorrection,
  voteCorrection,
} from "@/store/games";
import { CorrectionProposalState } from "@/types/games";
import { useConfetti, useStars } from "@/utils/confetti";
import {
  useAppDispatch,
  useAppSelector,
  useErrorToast,
  useLoadingSelector,
} from "@/utils/hooks";

import BuyTrackModal from "./components/BuyTrackModal";
import CorrectionProposalModal from "./components/CorrectionProposalModal";
import CorrectionProposalVotingModal from "./components/CorrectionProposalVotingModal";
import MaxTokenWarningSnackbar from "./components/MaxTokenWarningSnackbar";
import ScoringTabs from "./components/ScoringTabs";
import TrackBoughtPopup from "./components/TrackBoughtPopup";

const GameTurnScoringView = () => {
  const [buyTrackModalOpen, setBuyTrackModelOpen] = useState(false);
  const [buyTrackReminderModalOpen, setBuyTrackReminderModalOpen] =
    useState(false);
  const [correctionProposalModalOpen, setCorrectionProposalModalOpen] =
    useState(false);
  const [correctionVotingModalOpen, setCorrectionVotingModalOpen] =
    useState(false);
  const [showMaxTokenSnackbar, setShowMaxTokenSnackbar] = useState(false);

  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user)!;
  const game = useAppSelector((state) => state.games.game)!;
  const users = useAppSelector((state) => state.games.users);
  const boughtTrack = useAppSelector((state) => state.games.boughtTrack);

  const loadingBuyTrack = useLoadingSelector(buyTrack);
  const loadingCompleteTurn = useLoadingSelector(completeTurn);
  const loadingProposeCorrection = useLoadingSelector(proposeCorrection);
  useErrorToast(buyTrack, completeTurn, proposeCorrection, voteCorrection);

  const userId = user.id;
  const gameId = game.id;
  const turnId = game.turns.length - 1;
  const turn = game.turns[turnId];
  const currentPlayer = game.players.find((p) => p.userId === userId);
  const { isGameMaster = false } = currentPlayer || {};
  const { correctionProposal } = turn;
  const hasCompletedTurn = turn.completedBy.includes(userId);
  const canBuyTrack =
    !hasCompletedTurn &&
    currentPlayer &&
    currentPlayer?.tokens >= TOKEN_COST_BUY_TRACK;
  const canProposeCorrection =
    !hasCompletedTurn &&
    correctionProposal?.state !== CorrectionProposalState.Voting &&
    correctionProposal?.state !== CorrectionProposalState.Accepted;

  const hasMaxTokens =
    currentPlayer != null && currentPlayer?.tokens >= game.settings.maxTokens;
  useEffect(() => {
    setShowMaxTokenSnackbar(hasMaxTokens);
  }, [hasMaxTokens]);

  const showStars = turn?.scoring?.releaseYear?.position?.winner === userId;
  const { start: startStars } = useStars();
  useEffect(() => {
    if (showStars) {
      startStars();
    }
  }, [showStars, startStars]);

  const showConfetti =
    turn?.scoring?.releaseYear?.year?.winner === userId ||
    turn?.scoring?.credits?.winner === userId;
  const { start: startConfetti } = useConfetti();
  useEffect(() => {
    if (showConfetti) {
      startConfetti();
    }
  }, [showConfetti, startConfetti]);

  useEffect(() => {
    if (correctionProposal?.state === CorrectionProposalState.Voting) {
      setCorrectionVotingModalOpen(true);
    }
  }, [correctionProposal?.state]);

  const handleCompleteTurn = () => {
    if (currentPlayer && currentPlayer.tokens > TOKEN_COST_BUY_TRACK) {
      setBuyTrackReminderModalOpen(true);
    } else {
      dispatch(completeTurn({ gameId, turnId }));
    }
  };

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

      <BuyTrackReminderModal
        open={buyTrackReminderModalOpen}
        onConfirm={() => dispatch(completeTurn({ gameId, turnId }))}
        onClose={() => setBuyTrackReminderModalOpen(false)}
      />

      <CorrectionProposalModal
        open={correctionProposalModalOpen}
        track={turn.track}
        onConfirm={({ releaseYear }) =>
          dispatch(proposeCorrection({ gameId, turnId, releaseYear }))
        }
        onClose={() => setCorrectionProposalModalOpen(false)}
      />

      <CorrectionProposalVotingModal
        open={correctionVotingModalOpen}
        userId={userId}
        users={users}
        game={game}
        proposal={correctionProposal}
        onAgree={() =>
          dispatch(voteCorrection({ gameId, turnId, agree: true }))
        }
        onDisagree={() =>
          dispatch(voteCorrection({ gameId, turnId, agree: false }))
        }
        onClose={() => setCorrectionVotingModalOpen(false)}
      />

      <MaxTokenWarningSnackbar
        limit={game.settings.maxTokens}
        open={showMaxTokenSnackbar}
        onClose={() => setShowMaxTokenSnackbar(false)}
      />

      <TrackBoughtPopup
        open={!!boughtTrack}
        track={boughtTrack}
        onClose={() => dispatch(clearBoughtTrack())}
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
              onClick={handleCompleteTurn}
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

            <Button
              variant="soft"
              color="neutral"
              disabled={
                loadingProposeCorrection ||
                !canProposeCorrection ||
                hasCompletedTurn
              }
              onClick={() => setCorrectionProposalModalOpen(true)}
            >
              <PublishedWithChangesIcon />
            </Button>
          </Stack>
        </Stack>

        <ScoringTabs turn={turn} players={game.players} users={users} />
      </Stack>
    </View>
  );
};

export default GameTurnScoringView;
