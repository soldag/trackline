import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";

import ConfirmModal from "components/common/ConfirmModal";

const LeaveGameModal = ({ open, onConfirm, onClose }) => {
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

LeaveGameModal.propTypes = {
  open: PropTypes.bool,
  onConfirm: PropTypes.func,
  onClose: PropTypes.func,
};

export default LeaveGameModal;
