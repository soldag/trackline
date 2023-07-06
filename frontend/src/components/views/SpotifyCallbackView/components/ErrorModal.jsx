import PropTypes from "prop-types";
import { FormattedMessage, useIntl } from "react-intl";

import { Box, Button, Divider, Modal, ModalDialog, Typography } from "@mui/joy";

import { ErrorType } from "types/errors";
import { getErrorMessage } from "utils/errors";

const ErrorModal = ({ open, error, onRetry, onCancel }) => {
  const intl = useIntl();
  const message = error ? getErrorMessage(intl, error) : null;

  return (
    <Modal open={open}>
      <ModalDialog>
        <Typography
          component="h2"
          level="inherit"
          fontSize="1.25em"
          mb="0.25em"
        >
          <FormattedMessage
            id="SpotifyCallbackView.ErrorModel.header"
            defaultMessage="Connecting with Spotify failed"
          />
        </Typography>

        <Divider sx={{ my: 2 }} />

        {message && (
          <>
            {message}
            <Divider sx={{ my: 2 }} />
          </>
        )}

        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button variant="soft" color="neutral" onClick={onCancel}>
            <FormattedMessage
              id="SpotifyCallbackView.ErrorModel.cancel"
              defaultMessage="Cancel"
            />
          </Button>
          <Button onClick={onRetry}>
            <FormattedMessage
              id="SpotifyCallbackView.ErrorModel.retry"
              defaultMessage="Retry authorization"
            />
          </Button>
        </Box>
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
