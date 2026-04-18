import QrScanner from "qr-scanner";
import { useEffect, useRef, useState } from "react";

import { Box, CircularProgress } from "@mui/joy";
import type { SxProps } from "@mui/joy/styles/types";

import { JOIN_URL_REGEX } from "@/constants";

type OnResultCallback = (args: { joinCode: string }) => void;

interface QrCodeScannerProps {
  sx?: SxProps;
  onResult?: OnResultCallback;
}

const QrCodeScanner = ({ sx, onResult = () => {} }: QrCodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastJoinCode = useRef<string>(null);
  const onResultRef = useRef<OnResultCallback>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    if (!videoRef.current) return;

    const qrScanner = new QrScanner(
      videoRef.current,
      ({ data }) => {
        const [, joinCode] = data.match(JOIN_URL_REGEX) || [];
        if (joinCode != null && joinCode !== lastJoinCode.current) {
          onResultRef.current?.({ joinCode });
          lastJoinCode.current = joinCode;
        }
      },
      { returnDetailedScanResult: true },
    );
    qrScanner.start();
    return () => qrScanner.destroy();
  }, []);

  return (
    <Box
      sx={{
        ...sx,
        minWidth: "128px",
        minHeight: "128px",
        maxWidth: "100%",
        maxHeight: "100%",
        aspectRatio: "1",
        borderRadius: "sm",
        bgcolor: "background.level2",
        overflow: "hidden",
      }}
    >
      {!videoPlaying && (
        <Box
          sx={{
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress size="lg" color="neutral" thickness={5} />
        </Box>
      )}
      <video
        ref={videoRef}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        onPlaying={() => setVideoPlaying(true)}
        onPause={() => setVideoPlaying(false)}
      />
    </Box>
  );
};

export default QrCodeScanner;
