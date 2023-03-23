import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";

import ConfirmModal from "components/common/ConfirmModal";
import { TOKEN_COST_EXCHANGE_TRACK } from "constants";

const ExchangeTrackModal = ({ open, onConfirm, onClose }) => (
  <ConfirmModal
    open={open}
    onConfirm={onConfirm}
    onClose={onClose}
    header={
      <FormattedMessage
        id="GameTurnGuessingView.ExchangeTrackModal.header"
        defaultMessage="Exchange current track"
      />
    }
  >
    <FormattedMessage
      id="GameTurnGuessingView.ExchangeTrackModal.mainContent"
      defaultMessage="Do you want to exchange the current track by paying {cost} token?"
      values={{ cost: TOKEN_COST_EXCHANGE_TRACK }}
    />
  </ConfirmModal>
);

ExchangeTrackModal.propTypes = {
  open: PropTypes.bool,
  onConfirm: PropTypes.func,
  onClose: PropTypes.func,
};

export default ExchangeTrackModal;
