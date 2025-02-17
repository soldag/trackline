import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";

import ConfirmModal from "@/components/common/ConfirmModal";

const LogoutModal = ({ open, onConfirm, onClose }) => {
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

LogoutModal.propTypes = {
  open: PropTypes.bool,
  onConfirm: PropTypes.func,
  onClose: PropTypes.func,
};

export default LogoutModal;
