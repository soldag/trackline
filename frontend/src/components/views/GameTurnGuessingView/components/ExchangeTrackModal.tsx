import { FormattedMessage } from "react-intl";

import ConfirmModal from "@/components/common/ConfirmModal";
import { TOKEN_COST_EXCHANGE_TRACK } from "@/constants";

interface ExchangeTrackModalProps {
  open?: boolean;
  onConfirm?: () => void;
  onClose?: () => void;
}

const ExchangeTrackModal = ({
  open,
  onConfirm,
  onClose,
}: ExchangeTrackModalProps) => (
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
      id="GameTurnGuessingView.ExchangeTrackModal.content"
      defaultMessage="Do you want to exchange the current track by paying {cost, plural, =1 {#{nbsp}token} other {#{nbsp}tokens}}?"
      values={{ cost: TOKEN_COST_EXCHANGE_TRACK, nbsp: "\u00a0" }}
    />
  </ConfirmModal>
);

export default ExchangeTrackModal;
