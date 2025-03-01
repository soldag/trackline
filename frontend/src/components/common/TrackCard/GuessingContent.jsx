import { keyframes } from "@emotion/react";
import PropTypes from "prop-types";

import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import { CardContent } from "@mui/joy";

import CircularCountdown from "@/components/common/CircularCountdown";

const pulseEffect = keyframes`
  from {
    transform: scale(0.9);
  }
  50% {
    transform: scale(1);
  }
  to {
    transform: scale(0.9);
  }
`;

const GuessingContent = ({ timeoutStart, timeoutEnd }) => (
  <CardContent
    sx={{
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      maxHeight: "calc(0.5 * var(--TrackCard-size))",
    }}
  >
    {timeoutStart == null || timeoutEnd == null ? (
      <AudiotrackIcon
        sx={{
          flexGrow: 1,
          width: "100%",
          maxWidth: "175px",
          color: "var(--TrackCard-color-primary)",
          animation: `${pulseEffect} 3500ms ease-in-out infinite`,
        }}
      />
    ) : (
      <CircularCountdown
        defaultColor="success"
        start={timeoutStart}
        end={timeoutEnd}
      />
    )}
  </CardContent>
);

GuessingContent.propTypes = {
  timeoutStart: PropTypes.number,
  timeoutEnd: PropTypes.number,
};

export default GuessingContent;
