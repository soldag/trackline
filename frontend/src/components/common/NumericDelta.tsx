import { Typography } from "@mui/joy";
import type { ColorPaletteProp, SxProps } from "@mui/joy/styles/types";

const getColor = (value: number): ColorPaletteProp => {
  if (value < 0) {
    return "danger";
  } else if (value === 0) {
    return "warning";
  } else {
    return "success";
  }
};

interface NumericDeltaProps {
  color?: ColorPaletteProp | null;
  value: number;
  icon?: React.ReactNode;
  sx?: SxProps;
}

const NumericDelta = ({ color, value, icon, sx }: NumericDeltaProps) => {
  return (
    <Typography
      variant="soft"
      color={color ?? getColor(value)}
      sx={{ display: "inline-flex", ...sx }}
      endDecorator={icon}
    >
      {value >= 0 && "+"}
      {value}
    </Typography>
  );
};

export default NumericDelta;
