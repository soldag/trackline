import PropTypes from "prop-types";
import { useRef, useState } from "react";
import { useZxing } from "react-zxing";

import AspectRatio from "@mui/joy/AspectRatio";
import CircularProgress from "@mui/joy/CircularProgress";

import { JOIN_URL_REGEX } from "constants";

const QrScanner = ({ onResult = () => {} }) => {
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
    <AspectRatio
      ratio="1"
      variant="outlined"
      sx={{
        bgcolor: "background.level2",
        borderRadius: "sm",
      }}
    >
      {!videoPlaying && (
        <CircularProgress size="lg" color="neutral" thickness={5} />
      )}
      <video ref={videoRef} onPlaying={() => setVideoPlaying(true)} />
    </AspectRatio>
  );
};

QrScanner.propTypes = {
  onResult: PropTypes.func,
};

export default QrScanner;
