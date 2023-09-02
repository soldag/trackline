import { keyframes } from "@emotion/react";
import PropTypes from "prop-types";

import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import { CardContent } from "@mui/joy";

import CircularCountdown from "~/components/common/CircularCountdown";

const pulseEffect = keyframes`
  from {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  to {
    transform: scale(1);
  }
`;

const GuessingContent = ({ timeoutStart, timeoutEnd }) => (
  <CardContent sx={{ justifyContent: "center", alignItems: "center" }}>
    {timeoutStart == null || timeoutEnd == null ? (
      <AudiotrackIcon
        sx={{
          fontSize: {
            xs: "96px",
            md: "125px",
            lg: "150px",
          },
          animation: `${pulseEffect} 3500ms ease-in-out infinite`,
        }}
      />
    ) : (
      <CircularCountdown
        defaultColor="success"
        start={timeoutStart}
        timeout={timeoutEnd}
      />
    )}
  </CardContent>
);

GuessingContent.propTypes = {
  timeoutStart: PropTypes.number,
  timeoutEnd: PropTypes.number,
};

export default GuessingContent;
