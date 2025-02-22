import { PropsWithChildren } from "react";
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

interface ConfirmModalProps {
  open?: boolean;
  header?: React.ReactNode;
  canConfirm?: boolean;
  confirmLabel?: React.ReactNode;
  showCancel?: boolean;
  canCancel?: boolean;
  cancelLabel?: React.ReactNode;
  onConfirm?: () => void;
  onClose?: () => void;
}

const ConfirmModal = ({
  open = false,
  header,
  children,
  canConfirm = true,
  confirmLabel,
  showCancel = true,
  canCancel = true,
  cancelLabel,
  onConfirm,
  onClose,
}: PropsWithChildren<ConfirmModalProps>) => {
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
          <Button disabled={!canConfirm} onClick={handleConfirm}>
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

export default ConfirmModal;
