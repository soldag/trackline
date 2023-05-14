import PropTypes from "prop-types";
import { useIntl } from "react-intl";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ReportIcon from "@mui/icons-material/Report";
import { Alert, IconButton, Typography } from "@mui/joy";

import { ErrorType } from "types/errors";
import { getErrorMessage } from "utils/errors";

const ErrorAlert = ({ header, error, children, onDismiss }) => {
  const intl = useIntl();
  const message = error ? getErrorMessage(intl, error) : children;
  return (
    <Alert
      sx={{ alignItems: "flex-start" }}
      startDecorator={
        <ReportIcon sx={{ mt: "2px", mx: "4px" }} fontSize="xl2" />
      }
      variant="soft"
      color="danger"
      endDecorator={
        onDismiss && (
          <IconButton
            variant="soft"
            size="sm"
            color="danger"
            onClick={onDismiss}
          >
            <CloseRoundedIcon />
          </IconButton>
        )
      }
    >
      <div>
        {header && (
          <Typography fontWeight="lg" mt={0.25}>
            {header}
          </Typography>
        )}
        {message && (
          <Typography fontSize="sm" sx={{ opacity: 0.8 }}>
            {message}
          </Typography>
        )}
      </div>
    </Alert>
  );
};

ErrorAlert.propTypes = {
  header: PropTypes.node,
  error: ErrorType,
  children: PropTypes.node,
  onDismiss: PropTypes.func,
};

export default ErrorAlert;
