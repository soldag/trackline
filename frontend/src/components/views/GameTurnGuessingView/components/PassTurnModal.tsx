import React from "react";
import { FormattedMessage } from "react-intl";

import ConfirmModal from "@/components/common/ConfirmModal";

const getContent = (
  canGuessReleaseYear: boolean,
  canGuessCredits: boolean,
): React.ReactNode => {
  if (canGuessReleaseYear && canGuessCredits) {
    return (
      <FormattedMessage
        id="GameTurnGuessingView.PassTurnModal.content.canGuessAll"
        defaultMessage="Do you really want to pass this turn and reject guessing the track?"
      />
    );
  }

  if (canGuessReleaseYear && !canGuessCredits) {
    return (
      <FormattedMessage
        id="GameTurnGuessingView.PassTurnModal.content.canGuessReleaseYear"
        defaultMessage="Do you really want to pass this turn and reject guessing the release year of the track?"
      />
    );
  }

  if (!canGuessReleaseYear && canGuessCredits) {
    return (
      <FormattedMessage
        id="GameTurnGuessingView.PassTurnModal.content.canGuessCredits"
        defaultMessage="Do you really want to pass this turn and reject guessing the artist and title of the track?"
      />
    );
  }

  return (
    <FormattedMessage
      id="GameTurnGuessingView.PassTurnModal.content.cannotGuess"
      defaultMessage="Do you really want to pass this turn?"
    />
  );
};

interface PassTurnModalProps {
  open?: boolean;
  canGuessReleaseYear?: boolean;
  canGuessCredits?: boolean;
  onConfirm?: () => void;
  onClose?: () => void;
}

const PassTurnModal = ({
  open = false,
  canGuessReleaseYear = false,
  canGuessCredits = false,
  onConfirm,
  onClose,
}: PassTurnModalProps) => (
  <ConfirmModal
    open={open}
    onConfirm={onConfirm}
    onClose={onClose}
    header={
      <FormattedMessage
        id="GameTurnGuessingView.PassTurnModal.header"
        defaultMessage="Pass turn"
      />
    }
  >
    {getContent(canGuessReleaseYear, canGuessCredits)}
  </ConfirmModal>
);

export default PassTurnModal;
