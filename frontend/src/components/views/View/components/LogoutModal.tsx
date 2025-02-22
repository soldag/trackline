import { FormattedMessage } from "react-intl";

import ConfirmModal from "@/components/common/ConfirmModal";

interface LogoutModalProps {
  open: boolean;
  onConfirm?: () => void;
  onClose?: () => void;
}

const LogoutModal = ({ open, onConfirm, onClose }: LogoutModalProps) => {
  return (
    <ConfirmModal
      open={open}
      onConfirm={onConfirm}
      onClose={onClose}
      header={
        <FormattedMessage
          id="View.LogoutModal.header"
          defaultMessage="Logout"
        />
      }
    >
      <FormattedMessage
        id="View.LogoutModal.message"
        defaultMessage="Do you really want to logout?"
      />
    </ConfirmModal>
  );
};

export default LogoutModal;
