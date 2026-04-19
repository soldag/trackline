import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { matchPath } from "react-router";

import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { Box, Stack, Typography } from "@mui/joy";

import QrCodeScanner from "@/components/common/QrCodeScanner";
import { JOIN_URL_PATTERN } from "@/constants";
import { AppError } from "@/types/errors";
import { getErrorMessage } from "@/utils/errors";

const extractJoinCode = (joinUrl: string) => {
  const parsedUrl = URL.parse(joinUrl);
  if (parsedUrl?.origin !== document.location.origin) {
    return null;
  }

  const match = matchPath(JOIN_URL_PATTERN, parsedUrl.pathname);
  if (!match) {
    return null;
  }

  return match.params.joinCode;
};

interface ScanSectionProps {
  error?: AppError;
  loading?: boolean;
  onDismissError: () => void;
  onResult: (joinCode: string) => void;
}

const ScanSection = ({
  error,
  loading,
  onDismissError,
  onResult,
}: ScanSectionProps) => {
  const intl = useIntl();

  const [isInvalidCode, setIsInvalidCode] = useState(false);

  const handleResult = (result: string) => {
    const joinCode = extractJoinCode(result);
    if (joinCode) {
      onResult(joinCode);
    } else {
      setIsInvalidCode(true);
    }
  };

  let errorMessage: React.ReactNode | null = null;
  if (error) {
    errorMessage = getErrorMessage(intl, error);
  } else if (isInvalidCode) {
    errorMessage = (
      <FormattedMessage
        id="JoinGameView.ScanSection.invalidQrCode"
        defaultMessage="This QR code is invalid."
      />
    );
  }

  const handleRetry = () => {
    if (error) {
      onDismissError?.();
    } else {
      setIsInvalidCode(false);
    }
  };

  return (
    <Stack
      direction="column"
      spacing={2}
      sx={{ flex: { sm: "1 1 0" }, overflow: "hidden" }}
    >
      <Stack spacing={1}>
        <Typography
          level="title-md"
          startDecorator={<QrCodeScannerIcon color="primary" />}
        >
          <FormattedMessage
            id="JoinGameView.ScanSection.header"
            defaultMessage="Scan QR code"
          />
        </Typography>
        <Typography level="body-sm">
          <FormattedMessage
            id="JoinGameView.ScanSection.description"
            defaultMessage="Scan the QR code to join the game."
          />
        </Typography>
      </Stack>

      <Box sx={{ overflow: "hidden" }}>
        <QrCodeScanner
          sx={{ margin: { xs: "0 auto", sm: "0" } }}
          loading={loading}
          error={errorMessage}
          onResult={handleResult}
          onRetry={handleRetry}
        />
      </Box>
    </Stack>
  );
};

export default ScanSection;
