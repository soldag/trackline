import { FormattedMessage } from "react-intl";

import ConfirmModal from "@/components/common/ConfirmModal";

interface LeaveGameModalProps {
  open: boolean;
  onConfirm?: () => void;
  onClose?: () => void;
}

const LeaveGameModal = ({ open, onConfirm, onClose }: LeaveGameModalProps) => {
  return (
    <ConfirmModal
      open={open}
      onConfirm={onConfirm}
      onClose={onClose}
      header={
        <FormattedMessage
          id="View.LeaveGameModal.header"
          defaultMessage="Leave game"
        />
      }
    >
      <FormattedMessage
        id="View.LeaveGameModal.message"
        defaultMessage="Do you really want to leave this game?"
      />
    </ConfirmModal>
  );
};

export default LeaveGameModal;
