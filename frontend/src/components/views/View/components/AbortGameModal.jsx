import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";

import ConfirmModal from "components/common/ConfirmModal";

const AbortGameModal = ({ open, onConfirm, onClose }) => {
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

AbortGameModal.propTypes = {
  open: PropTypes.bool,
  onConfirm: PropTypes.func,
  onClose: PropTypes.func,
};

export default AbortGameModal;
