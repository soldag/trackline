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

import TokenCost from "@/components/common/TokenCost";

export type ConfirmModalProps = PropsWithChildren<{
  open?: boolean;
  header?: React.ReactNode;
  canConfirm?: boolean;
  confirmLabel?: React.ReactNode;
  tokenCost?: number;
  showCancel?: boolean;
  canCancel?: boolean;
  cancelLabel?: React.ReactNode;
  onConfirm?: () => void;
  onClose?: () => void;
}>;

const ConfirmModal = ({
  open = false,
  header,
  children,
  canConfirm = true,
  confirmLabel,
  tokenCost,
  showCancel = true,
  canCancel = true,
  cancelLabel,
  onConfirm,
  onClose,
}: ConfirmModalProps) => {
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
            {confirmLabel ?? (
              <FormattedMessage
                id="ConfirmModal.confirm"
                defaultMessage="Confirm"
              />
            )}
            {tokenCost != null && tokenCost > 0 && (
              <TokenCost cost={tokenCost} sx={{ ml: 0.5 }} />
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
