import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";

import ConfirmModal from "components/common/ConfirmModal";

const RejectGuessModal = ({ open, onConfirm, onClose }) => (
  <ConfirmModal
    open={open}
    onConfirm={onConfirm}
    onClose={onClose}
    header={
      <FormattedMessage
        id="GameTurnGuessingView.RejectGuessModal.header"
        defaultMessage="Reject guessing track"
      />
    }
  >
    <FormattedMessage
      id="GameTurnGuessingView.RejectGuessModal.mainContent"
      defaultMessage="Do you really want to reject guessing this track?"
    />
  </ConfirmModal>
);

RejectGuessModal.propTypes = {
  open: PropTypes.bool,
  onConfirm: PropTypes.func,
  onClose: PropTypes.func,
};

export default RejectGuessModal;
