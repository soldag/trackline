import { FormattedMessage } from "react-intl";

import ConfirmModal from "@/components/common/ConfirmModal";

interface BuyTrackReminderModalProps {
  open?: boolean;
  onConfirm?: () => void;
  onClose?: () => void;
}

const BuyTrackReminderModal = ({
  open,
  onConfirm,
  onClose,
}: BuyTrackReminderModalProps) => {
  return (
    <ConfirmModal
      open={open}
      onConfirm={onConfirm}
      onClose={onClose}
      header={
        <FormattedMessage
          id="GameTurnScoringView.BuyTrackReminderModal.header"
          defaultMessage="Buy track?"
        />
      }
      confirmLabel={
        <FormattedMessage
          id="GameTurnScoringView.BuyTrackReminderModal.confirmLabel"
          defaultMessage="Continue anyway"
        />
      }
    >
      <FormattedMessage
        id="GameTurnScoringView.BuyTrackReminderModal.message"
        defaultMessage="You have enough tokens to add an extra track to your timeline. Are you sure you want to continue without buying one?"
      />
    </ConfirmModal>
  );
};

export default BuyTrackReminderModal;
