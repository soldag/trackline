import QrScanner from "qr-scanner";
import { useCallback, useEffect, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";

import ErrorIcon from "@mui/icons-material/Error";
import LoopIcon from "@mui/icons-material/Loop";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/joy";
import type { SxProps } from "@mui/joy/styles/types";

type OnResultCallback = (result: string) => void;

interface QrCodeScannerProps {
  sx?: SxProps;
  disabled?: boolean;
  loading?: boolean;
  error?: React.ReactNode;
  onResult?: OnResultCallback;
  onRetry?: () => void;
}

const QrCodeScanner = ({
  sx,
  disabled,
  loading,
  error,
  onResult,
  onRetry,
}: QrCodeScannerProps) => {
  const scannerRef = useRef<QrScanner>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastResult = useRef<string>(null);
  const onResultRef = useRef<OnResultCallback>(null);

  const [hasScannerError, setHasScannerError] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const hasPropsError = !!error;
  const hasError = hasScannerError || hasPropsError;
  const isInitializing = !disabled && !hasError && !isVideoPlaying;
  const isReady = !disabled && !hasError && !isInitializing;

  const initScanner = useCallback(() => {
    if (!videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      ({ data }) => {
        if (data !== lastResult.current) {
          window.navigator.vibrate?.(40);
          onResultRef.current?.(data);
          lastResult.current = data;
        }
      },
      {
        onDecodeError: () => {
          lastResult.current = null;
        },
        returnDetailedScanResult: true,
      },
    );
    scannerRef.current = scanner;

    return scanner;
  }, []);

  const startScanner = useCallback(() => {
    setHasScannerError(false);
    scannerRef.current?.start().catch(() => setHasScannerError(true));
  }, []);

  const handleRetry = useCallback(() => {
    lastResult.current = null;

    if (hasScannerError) {
      startScanner();
    } else {
      onRetry?.();
    }
  }, [hasScannerError, onRetry, startScanner]);

  useEffect(() => {
    onResultRef.current = onResult ?? null;
  }, [onResult]);

  useEffect(() => {
    if (!disabled) {
      const scanner = initScanner();
      return () => scanner?.destroy();
    }
  }, [disabled, initScanner]);

  useEffect(() => {
    if (disabled) return;

    if (hasPropsError) {
      scannerRef.current?.pause();
    } else {
      startScanner();
    }
  }, [disabled, hasPropsError, startScanner]);

  return (
    <Box
      sx={{
        ...sx,
        aspectRatio: "1",
        bgcolor: "background.level2",
        borderColor: "neutral.outlinedBorder",
        borderRadius: "sm",
        borderStyle: "solid",
        borderWidth: "1px",
        maxHeight: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {!isReady && (
        <Stack
          gap={1}
          alignItems="center"
          justifyContent="center"
          sx={{
            height: "100%",
            width: "100%",
            p: 2,
          }}
        >
          {isInitializing && (
            <CircularProgress size="lg" color="neutral" thickness={5} />
          )}

          {hasError && (
            <>
              {hasScannerError ? (
                <VideocamOffIcon sx={{ fontSize: "4rem" }} />
              ) : (
                <ErrorIcon sx={{ fontSize: "4rem" }} />
              )}

              <Typography
                textAlign="center"
                textColor="neutral.500"
                fontWeight="lg"
              >
                {hasScannerError ? (
                  <FormattedMessage
                    id="QrCodeScanner.error"
                    defaultMessage="Can't access camera. Please check your settings and retry."
                  />
                ) : (
                  error
                )}
              </Typography>

              <Button
                color="neutral"
                size="sm"
                startDecorator={<LoopIcon />}
                sx={{ mt: 1 }}
                onClick={handleRetry}
              >
                <FormattedMessage
                  id="QrCodeScanner.retry"
                  defaultMessage="Retry"
                />
              </Button>
            </>
          )}
        </Stack>
      )}

      <video
        ref={videoRef}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        onPlaying={() => setIsVideoPlaying(true)}
        onPause={() => setIsVideoPlaying(false)}
      />

      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "background.backdrop",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress size="lg" color="neutral" thickness={5} />
        </Box>
      )}
    </Box>
  );
};

export default QrCodeScanner;
