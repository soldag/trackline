import { PropsWithChildren } from "react";
import { useIntl } from "react-intl";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ReportIcon from "@mui/icons-material/Report";
import { Alert, IconButton, Typography } from "@mui/joy";

import { AppError } from "@/types/errors";
import { getErrorMessage } from "@/utils/errors";

interface ErrorAlertProps {
  header?: React.ReactNode;
  error?: AppError;
  onDismiss?: () => void;
}

const ErrorAlert = ({
  header,
  error,
  children,
  onDismiss,
}: PropsWithChildren<ErrorAlertProps>) => {
  const intl = useIntl();
  const message = error ? getErrorMessage(intl, error) : children;
  return (
    <Alert
      sx={{ alignItems: "flex-start" }}
      startDecorator={
        <ReportIcon sx={{ mt: "2px", mx: "4px" }} fontSize="large" />
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

export default ErrorAlert;
