import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";

import ResponsiveCircularProgress from "~/components/common/ResponsiveCircularProgress";
import { useCountdown } from "~/utils/hooks";

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

const CircularCountdown = ({ start, end, defaultColor }) => {
  const { progress, remaining } = useCountdown({ start, end });
  const color = getColor(progress, defaultColor);

  return (
    <ResponsiveCircularProgress
      determinate
      color={color}
      value={progress * 100}
      sx={{
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
    </ResponsiveCircularProgress>
  );
};

CircularCountdown.propTypes = {
  start: PropTypes.number.isRequired,
  end: PropTypes.number.isRequired,
  defaultColor: PropTypes.string,
};

export default CircularCountdown;
