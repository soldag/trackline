import { useCallback } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Modal,
  ModalDialog,
  Stack,
  Typography,
} from "@mui/joy";

import VotingButton from "@/components/common/VotingButton";
import {
  CorrectionProposal,
  CorrectionProposalState,
  Game,
} from "@/types/games";
import { User } from "@/types/users";
import { getPossessiveForm } from "@/utils/i18n";

interface CorrectionProposalVotingModalProps {
  open?: boolean;
  users?: User[];
  userId?: string;
  game?: Game;
  proposal?: CorrectionProposal;
  onAgree?: () => void;
  onDisagree?: () => void;
  onClose?: () => void;
}

const CorrectionProposalVotingModal = ({
  open = false,
  userId,
  users,
  game,
  proposal,
  onAgree,
  onDisagree,
  onClose,
}: CorrectionProposalVotingModalProps) => {
  const { locale } = useIntl();

  const username = users?.find((u) => u.id === proposal?.createdBy)?.username;

  const votes = proposal?.votes ?? [];
  const hasVoted = votes.some((v) => v.userId === userId);

  const numberOfPlayers = game?.players?.length ?? 0;
  const numberOfAgreeVotes = votes.filter((v) => v.agree).length;
  const numberOfDisagreeVotes = votes.filter((v) => !v.agree).length;

  const isVoting = proposal?.state === CorrectionProposalState.Voting;
  const isAccepted = proposal?.state === CorrectionProposalState.Accepted;
  const isRejected = proposal?.state === CorrectionProposalState.Rejected;

  const isCurrentUser = proposal?.createdBy === userId;

  const handleClose = useCallback(() => {
    if (!isVoting) {
      onClose?.();
    }
  }, [isVoting, onClose]);

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog
        sx={{
          "overflowY": "auto",
          "overflowX": "hidden",
          "maxWidth": "500px",
          "--ModalDialog-minWidth": "400px",
        }}
      >
        <DialogTitle>
          <FormattedMessage
            id="GameTurnScoringView.CorrectionProposalVotingModal.header"
            defaultMessage="Scoring correction"
          />
        </DialogTitle>

        <Divider />

        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            {isVoting && (
              <FormattedMessage
                id="GameTurnScoringView.CorrectionProposalVotingModal.content.voting"
                defaultMessage="{isCurrentUser, select, true {You have} other {{username} has}} suggested changing the track's release year to <bold>{releaseYear}</bold>. If at least half of the players agree, the scoring will be updated accordingly."
                values={{
                  isCurrentUser,
                  username,
                  releaseYear: proposal?.releaseYear,
                  // Key is needed as a workaround until https://github.com/formatjs/formatjs/issues/4782 is fixed
                  bold: (chunks) => (
                    <strong key={Math.random()}>{chunks}</strong>
                  ),
                }}
              />
            )}
            {isAccepted && (
              <FormattedMessage
                id="GameTurnScoringView.CorrectionProposalVotingModal.content.accepted"
                defaultMessage="{isCurrentUser, select, true {Your} other {{username}}} proposal to change the track's release year to <bold>{releaseYear}</bold> has been accepted. The scoring was updated accordingly."
                values={{
                  isCurrentUser,
                  username: getPossessiveForm(username, locale),
                  releaseYear: proposal?.releaseYear,
                  // Key is needed as a workaround until https://github.com/formatjs/formatjs/issues/4782 is fixed
                  bold: (chunks) => (
                    <strong key={Math.random()}>{chunks}</strong>
                  ),
                }}
              />
            )}
            {isRejected && (
              <FormattedMessage
                id="GameTurnScoringView.CorrectionProposalVotingModal.content.rejected"
                defaultMessage="{isCurrentUser, select, true {Your} other {{username}}} proposal to change the track's release year to <bold>{releaseYear}</bold> has been rejected."
                values={{
                  isCurrentUser,
                  username: getPossessiveForm(username, locale),
                  releaseYear: proposal?.releaseYear,
                  // Key is needed as a workaround until https://github.com/formatjs/formatjs/issues/4782 is fixed
                  bold: (chunks) => (
                    <strong key={Math.random()}>{chunks}</strong>
                  ),
                }}
              />
            )}
          </Typography>

          <Stack direction="column" spacing={1}>
            <VotingButton
              color="success"
              icon={<ThumbUpIcon />}
              canVote={!hasVoted}
              currentVotes={numberOfAgreeVotes}
              maxVotes={numberOfPlayers}
              onClick={onAgree}
            >
              <FormattedMessage
                id="GameTurnScoringView.CorrectionProposalVotingModal.agree"
                defaultMessage="Agree"
              />
            </VotingButton>
            <VotingButton
              color="danger"
              icon={<ThumbDownIcon />}
              canVote={!hasVoted}
              currentVotes={numberOfDisagreeVotes}
              maxVotes={numberOfPlayers}
              onClick={onDisagree}
            >
              <FormattedMessage
                id="GameTurnScoringView.CorrectionProposalVotingModal.disagree"
                defaultMessage="Disagree"
              />
            </VotingButton>
          </Stack>

          {(isAccepted || isRejected) && (
            <DialogActions>
              <Button onClick={onClose}>
                <FormattedMessage
                  id="GameTurnScoringView.CorrectionProposalVotingModal.close"
                  defaultMessage="Close"
                />
              </Button>
            </DialogActions>
          )}
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default CorrectionProposalVotingModal;
