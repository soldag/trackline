import { Fragment, ReactNode } from "react";

import { Box, Typography } from "@mui/joy";

interface StatsGridProps {
  data: {
    key: string;
    label: ReactNode;
    value: ReactNode;
  }[];
}

const StatsGrid = ({ data }: StatsGridProps) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: "1fr auto",
      gap: 1,
    }}
  >
    {data.map(({ key, label, value }) => (
      <Fragment key={key}>
        <Typography level="body-sm">{label}</Typography>
        <Typography level="body-sm" textAlign="right">
          {value}
        </Typography>
      </Fragment>
    ))}
  </Box>
);

export default StatsGrid;
