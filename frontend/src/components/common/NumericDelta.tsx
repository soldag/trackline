import { Chip } from "@mui/joy";
import type { ColorPaletteProp, SxProps } from "@mui/joy/styles/types";

import { mergeSx } from "@/utils/style";

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
    <Chip
      size="sm"
      variant="soft"
      color={color ?? getColor(value)}
      endDecorator={icon}
      sx={mergeSx({ px: 0.75, py: 0.25 }, sx)}
    >
      {value >= 0 && "+"}
      {value}
    </Chip>
  );
};

export default NumericDelta;
