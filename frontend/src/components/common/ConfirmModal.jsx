import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";

import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Modal,
  ModalDialog,
} from "@mui/joy";

const ConfirmModal = ({
  open,
  header,
  children,
  canConfirm = true,
  confirmLabel,
  showCancel = true,
  canCancel = true,
  cancelLabel,
  onConfirm,
  onClose,
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        sx={{
          "overflowY": "auto",
          "overflowX": "hidden",
          "maxWidth": "500px",
          "--ModalDialog-minWidth": "400px",
        }}
      >
        {header && <DialogTitle>{header}</DialogTitle>}
        {header && children && <Divider />}
        {children && <DialogContent>{children}</DialogContent>}

        <DialogActions>
          <Button
            variant="solid"
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            {confirmLabel || (
              <FormattedMessage
                id="ConfirmModal.confirm"
                defaultMessage="Confirm"
              />
            )}
          </Button>
          {showCancel && (
            <Button
              variant="plain"
              color="neutral"
              disabled={!canCancel}
              onClick={onClose}
            >
              {cancelLabel || (
                <FormattedMessage
                  id="ConfirmModal.cancel"
                  defaultMessage="Cancel"
                />
              )}
            </Button>
          )}
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};

ConfirmModal.propTypes = {
  open: PropTypes.bool,
  header: PropTypes.node,
  children: PropTypes.node,
  canConfirm: PropTypes.bool,
  confirmLabel: PropTypes.node,
  showCancel: PropTypes.bool,
  canCancel: PropTypes.bool,
  cancelLabel: PropTypes.node,
  onConfirm: PropTypes.func,
  onClose: PropTypes.func,
};

export default ConfirmModal;
