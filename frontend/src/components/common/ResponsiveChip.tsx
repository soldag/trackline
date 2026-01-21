import * as _ from "lodash-es";

import { Chip, ChipProps } from "@mui/joy";

export const ResponsiveChip = ({ slotProps, ...remainingProps }: ChipProps) => (
  <Chip
    {...remainingProps}
    slotProps={_.merge(slotProps, {
      root: { sx: { overflow: "hidden", pointerEvents: "none" } },
    })}
  />
);
