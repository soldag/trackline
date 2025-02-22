import { FormattedMessage } from "react-intl";

import ConfirmModal from "@/components/common/ConfirmModal";

interface AbortGameModalProps {
  open: boolean;
  onConfirm?: () => void;
  onClose?: () => void;
}

const AbortGameModal = ({ open, onConfirm, onClose }: AbortGameModalProps) => {
  return (
    <ConfirmModal
      open={open}
      onConfirm={onConfirm}
      onClose={onClose}
      header={
        <FormattedMessage
          id="View.AbortGameModal.header"
          defaultMessage="Abort game"
        />
      }
    >
      <FormattedMessage
        id="View.AbortGameModal.message"
        defaultMessage="Do you really want to abort this game? The other players won't be able to continue playing."
      />
    </ConfirmModal>
  );
};

export default AbortGameModal;
