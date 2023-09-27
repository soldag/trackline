import PropTypes from "prop-types";
import { FormattedMessage, useIntl } from "react-intl";

import {
  Button,
  DialogActions,
  DialogTitle,
  Divider,
  Modal,
  ModalDialog,
} from "@mui/joy";

import { ErrorType } from "~/types/errors";
import { getErrorMessage } from "~/utils/errors";

const ErrorModal = ({ open, error, onRetry, onCancel }) => {
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

ErrorModal.propTypes = {
  open: PropTypes.bool,
  error: ErrorType,
  onRetry: PropTypes.func,
  onCancel: PropTypes.func,
};

export default ErrorModal;
