import { PropsWithChildren } from "react";

import { Box, Stack, Typography } from "@mui/joy";
import { SxProps } from "@mui/joy/styles/types";

interface ScoringSectionProps extends PropsWithChildren {
  header: React.ReactNode;
  action?: React.ReactNode;
  sx?: SxProps;
}

const ScoringSection = ({
  header,
  action,
  children,
  sx,
}: ScoringSectionProps) => (
  <Box sx={sx}>
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={1}
      sx={{ mb: 1 }}
    >
      <Typography
        level="body-xs"
        textTransform="uppercase"
        letterSpacing="0.05rem"
        textColor="text.tertiary"
      >
        {header}
      </Typography>
      {action}
    </Stack>

    {children}
  </Box>
);

export default ScoringSection;
