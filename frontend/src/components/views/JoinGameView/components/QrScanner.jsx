import PropTypes from "prop-types";
import { useRef, useState } from "react";
import { useZxing } from "react-zxing";

import { Box, CircularProgress } from "@mui/joy";

import { JOIN_URL_REGEX } from "constants";
import SxType from "types/mui";

const QrScanner = ({ sx, onResult = () => {} }) => {
  const lastGameId = useRef();
  const [videoPlaying, setVideoPlaying] = useState(false);

  const { ref: videoRef } = useZxing({
    onResult: ({ text }) => {
      const [, gameId] = text.match(JOIN_URL_REGEX) || [];
      if (gameId != null && gameId !== lastGameId.current) {
        onResult({ gameId });
        lastGameId.current = gameId;
      }
    },
  });

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
      />
    </Box>
  );
};

QrScanner.propTypes = {
  sx: SxType,
  onResult: PropTypes.func,
};

export default QrScanner;
