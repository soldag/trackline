import { FormattedMessage } from "react-intl";

import { ColorPaletteProp } from "@mui/joy";

import ResponsiveCircularProgress from "@/components/common/ResponsiveCircularProgress";
import { useCountdown } from "@/utils/hooks";

const DANGER_THRESHOLD = 0.75;
const WARNING_THRESHOLD = 0.5;

const getColor = (progress: number, defaultColor?: ColorPaletteProp) => {
  if (progress >= DANGER_THRESHOLD) {
    return "danger";
  }
  if (progress >= WARNING_THRESHOLD) {
    return "warning";
  }

  return defaultColor;
};

interface CircularCountdownProps {
  start: number;
  end: number;
  defaultColor?: ColorPaletteProp;
}

const CircularCountdown = ({
  start,
  end,
  defaultColor,
}: CircularCountdownProps) => {
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

export default CircularCountdown;
