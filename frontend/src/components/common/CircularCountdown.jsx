import PropTypes from "prop-types";
import { useState } from "react";
import { FormattedMessage } from "react-intl";

import { CircularProgress } from "@mui/joy";

import { useInterval } from "utils/hooks";

const DANGER_THRESHOLD = 0.75;
const WARNING_THRESHOLD = 0.5;

const getColor = (progress, defaultColor) => {
  if (progress >= DANGER_THRESHOLD) {
    return "danger";
  }
  if (progress >= WARNING_THRESHOLD) {
    return "warning";
  }

  return defaultColor;
};

const CircularCountdown = ({
  start,
  timeout,
  defaultColor,
  updateInterval = 100,
}) => {
  const [progress, setProgress] = useState(0);
  const [remaining, setRemaining] = useState(timeout - start);

  const color = getColor(progress, defaultColor);

  useInterval(() => {
    const total = timeout - start;
    const newRemaining = Math.max(0, timeout - Date.now());
    setProgress((total - newRemaining) / total);
    setRemaining(newRemaining);
  }, updateInterval);

  return (
    <CircularProgress
      determinate
      color={color}
      value={progress * 100}
      sx={{
        "--CircularProgress-size": "96px",
        "--CircularProgress-track-thickness": "10px",
        "--CircularProgress-progress-thickness": "10px",
        "& *": {
          transition: "stroke 1000ms, color 1000ms",
        },
      }}
    >
      <FormattedMessage
        id="CircularCountdown.seconds"
        defaultMessage="{value} s"
        values={{ value: Math.floor(remaining / 1000) }}
      />
    </CircularProgress>
  );
};

CircularCountdown.propTypes = {
  start: PropTypes.number.isRequired,
  timeout: PropTypes.number.isRequired,
  defaultColor: PropTypes.string,
  updateInterval: PropTypes.number,
};

export default CircularCountdown;
