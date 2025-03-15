import { FormattedMessage } from "react-intl";

import ConfirmModal from "@/components/common/ConfirmModal";
import { TOKEN_COST_BUY_TRACK } from "@/constants";

interface BuyTrackModalProps {
  open?: boolean;
  onConfirm?: () => void;
  onClose?: () => void;
}

const BuyTrackModal = ({ open, onConfirm, onClose }: BuyTrackModalProps) => {
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
        values={{ cost: TOKEN_COST_BUY_TRACK, nbsp: "\u00a0" }}
      />
    </ConfirmModal>
  );
};

export default BuyTrackModal;
