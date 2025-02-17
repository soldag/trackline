import PropTypes from "prop-types";
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
import { CORRECTION_PROPOSAL_STATES } from "@/constants";
import { CorrectionProposalType, GameType } from "@/types/games";
import { UserType } from "@/types/users";
import { getPossessiveForm } from "@/utils/i18n";

const CorrectionProposalVotingModal = ({
  open,
  userId,
  users,
  game,
  proposal,
  onAgree,
  onDisagree,
  onClose,
}) => {
  const { locale } = useIntl();

  const username = users.find((u) => u.id === proposal?.createdBy)?.username;

  const votes = proposal?.votes ?? [];
  const hasVoted = votes.some((v) => v.userId === userId);

  const numberOfPlayers = game.players.length;
  const numberOfAgreeVotes = votes.filter((v) => v.agree).length;
  const numberOfDisagreeVotes = votes.filter((v) => !v.agree).length;

  const isVoting = proposal?.state === CORRECTION_PROPOSAL_STATES.VOTING;
  const isAccepted = proposal?.state === CORRECTION_PROPOSAL_STATES.ACCEPTED;
  const isRejected = proposal?.state === CORRECTION_PROPOSAL_STATES.REJECTED;

  const isCurrentUser = proposal?.createdBy === userId;

  return (
    <Modal open={open} onClose={!isVoting ? onClose : null}>
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
                  bold: (chunks) => <strong>{chunks}</strong>,
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
                  bold: (chunks) => <strong>{chunks}</strong>,
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
                  bold: (chunks) => <strong>{chunks}</strong>,
                }}
              />
            )}
          </Typography>

          <Stack direction="column" spacing={1}>
            <VotingButton
              color="success"
              icon={<ThumbUpIcon />}
              canVote={!hasVoted}
              isVoting={isVoting}
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
              isVoting={isVoting}
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

CorrectionProposalVotingModal.propTypes = {
  open: PropTypes.bool,
  users: PropTypes.arrayOf(UserType),
  userId: PropTypes.string,
  game: GameType,
  proposal: CorrectionProposalType,
  onAgree: PropTypes.func,
  onDisagree: PropTypes.func,
  onClose: PropTypes.func,
};

export default CorrectionProposalVotingModal;
