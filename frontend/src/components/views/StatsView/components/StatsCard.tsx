import { ReactNode } from "react";

import { Card, CardContent, Typography } from "@mui/joy";
import { SxProps } from "@mui/joy/styles/types";

import { mergeSx } from "@/utils/style";

interface StatsCardProps {
  sx?: SxProps;
  title: ReactNode;
  children: ReactNode;
}

const StatsCard = ({ sx, title, children }: StatsCardProps) => (
  <Card variant="outlined" sx={mergeSx({ boxShadow: "sm" }, sx)}>
    <CardContent>
      <Typography fontSize="sm" fontWeight="lg" color="primary" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {children}
    </CardContent>
  </Card>
);

export default StatsCard;
