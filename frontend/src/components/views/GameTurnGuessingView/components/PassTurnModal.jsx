import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";

import ConfirmModal from "~/components/common/ConfirmModal";

const getContent = (canGuessReleaseYear, canGuessCredits) => {
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

const PassTurnModal = ({
  open,
  canGuessReleaseYear,
  canGuessCredits,
  onConfirm,
  onClose,
}) => (
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

PassTurnModal.propTypes = {
  open: PropTypes.bool,
  canGuessReleaseYear: PropTypes.bool,
  canGuessCredits: PropTypes.bool,
  onConfirm: PropTypes.func,
  onClose: PropTypes.func,
};

export default PassTurnModal;
