import PropTypes from "prop-types";
import QrScanner from "qr-scanner";
import { useEffect, useRef, useState } from "react";

import { Box, CircularProgress } from "@mui/joy";

import { JOIN_URL_REGEX } from "~/constants";
import SxType from "~/types/mui";

const QrCodeScanner = ({ sx, onResult = () => {} }) => {
  const videoRef = useRef();
  const lastGameId = useRef();
  const onResultRef = useRef();
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    onResultRef.current = onResultRef;
  }, [onResult]);

  useEffect(() => {
    const qrScanner = new QrScanner(
      videoRef.current,
      ({ data }) => {
        const [, gameId] = data.match(JOIN_URL_REGEX) || [];
        if (gameId != null && gameId !== lastGameId.current) {
          onResultRef.current?.({ gameId });
          lastGameId.current = gameId;
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

QrCodeScanner.propTypes = {
  sx: SxType,
  onResult: PropTypes.func,
};

export default QrCodeScanner;
