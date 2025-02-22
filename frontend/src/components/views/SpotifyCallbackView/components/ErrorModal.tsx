import { FormattedMessage, useIntl } from "react-intl";

import {
  Button,
  DialogActions,
  DialogTitle,
  Divider,
  Modal,
  ModalDialog,
} from "@mui/joy";

import { AppError } from "@/types/errors";
import { getErrorMessage } from "@/utils/errors";

interface ErrorModalProps {
  open?: boolean;
  error?: AppError;
  onRetry?: () => void;
  onCancel?: () => void;
}

const ErrorModal = ({
  open = false,
  error,
  onRetry,
  onCancel,
}: ErrorModalProps) => {
  const intl = useIntl();
  const message = error ? getErrorMessage(intl, error) : null;

  return (
    <Modal open={open}>
      <ModalDialog>
        <DialogTitle>
          <FormattedMessage
            id="SpotifyCallbackView.ErrorModel.header"
            defaultMessage="Connecting with Spotify failed"
          />
        </DialogTitle>
        <Divider />

        {message}

        <DialogActions>
          <Button onClick={onRetry}>
            <FormattedMessage
              id="SpotifyCallbackView.ErrorModel.retry"
              defaultMessage="Retry authorization"
            />
          </Button>
          <Button variant="plain" color="neutral" onClick={onCancel}>
            <FormattedMessage
              id="SpotifyCallbackView.ErrorModel.cancel"
              defaultMessage="Cancel"
            />
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};

export default ErrorModal;
