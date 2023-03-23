import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";

import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import Typography from "@mui/joy/Typography";

const ConfirmModal = ({
  open,
  header,
  children,
  confirmLabel,
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
        sx={{ "maxWidth": "500px", "--ModalDialog-minWidth": "400px" }}
      >
        {header && (
          <>
            <Typography
              component="h2"
              level="inherit"
              fontSize="1.25em"
              mb="0.25em"
            >
              {header}
            </Typography>

            <Divider sx={{ my: 2 }} />
          </>
        )}

        {children && (
          <>
            {children}
            <Divider sx={{ my: 2 }} />
          </>
        )}

        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          {canCancel && (
            <Button variant="soft" color="neutral" onClick={onClose}>
              {cancelLabel || (
                <FormattedMessage
                  id="ConfirmModal.cancel"
                  defaultMessage="Cancel"
                />
              )}
            </Button>
          )}
          <Button onClick={handleConfirm}>
            {confirmLabel || (
              <FormattedMessage
                id="ConfirmModal.confirm"
                defaultMessage="Confirm"
              />
            )}
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

ConfirmModal.propTypes = {
  open: PropTypes.bool,
  header: PropTypes.node,
  children: PropTypes.node,
  confirmLabel: PropTypes.node,
  canCancel: PropTypes.bool,
  cancelLabel: PropTypes.node,
  onConfirm: PropTypes.func,
  onClose: PropTypes.func,
};

export default ConfirmModal;
