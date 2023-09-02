import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";

import { Box, Button, Divider, Modal, ModalDialog, Typography } from "@mui/joy";

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
          "maxWidth": "500px",
          "--ModalDialog-minWidth": "400px",
        }}
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
          {showCancel && (
            <Button
              variant="soft"
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
          <Button disabled={!canConfirm} onClick={handleConfirm}>
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
  canConfirm: PropTypes.bool,
  confirmLabel: PropTypes.node,
  showCancel: PropTypes.bool,
  canCancel: PropTypes.bool,
  cancelLabel: PropTypes.node,
  onConfirm: PropTypes.func,
  onClose: PropTypes.func,
};

export default ConfirmModal;
