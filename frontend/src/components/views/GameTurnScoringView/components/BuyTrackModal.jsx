import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";

import ConfirmModal from "@/components/common/ConfirmModal";
import { TOKEN_COST_BUY_TRACK } from "@/constants";

const BuyTrackModal = ({ open, onConfirm, onClose }) => {
  return (
    <ConfirmModal
      open={open}
      onConfirm={onConfirm}
      onClose={onClose}
      header={
        <FormattedMessage
          id="GameTurnScoringView.BuyTrackModal.header"
          defaultMessage="Buy track"
        />
      }
      confirmLabel={
        <FormattedMessage
          id="GameTurnScoringView.BuyTrackModal.confirm"
          defaultMessage="Buy track"
        />
      }
    >
      <FormattedMessage
        id="GameTurnScoringView.BuyTrackModal.message"
        defaultMessage="Do you want to spend {cost, plural, =1 {#{nbsp}token} other {#{nbsp}tokens}} to buy an extra track for your timeline?"
        values={{ cost: TOKEN_COST_BUY_TRACK, nbsp: <>&nbsp;</> }}
      />
    </ConfirmModal>
  );
};

BuyTrackModal.propTypes = {
  open: PropTypes.bool,
  onConfirm: PropTypes.func,
  onClose: PropTypes.func,
};

export default BuyTrackModal;
