import { ReactNode } from "react";

import { Box, Card, CardContent, Typography } from "@mui/joy";

interface MetricCardProps {
  icon: ReactNode;
  label: ReactNode;
  value: ReactNode;
}

const MetricCard = ({ icon, label, value }: MetricCardProps) => (
  <Card
    variant="outlined"
    sx={(theme) => ({
      "boxShadow": "sm",
      "--Icon-color": theme.palette.primary.plainColor,
    })}
  >
    <CardContent orientation="horizontal" sx={{ alignItems: "center" }}>
      <Box sx={{ display: "flex", fontSize: "2em" }}>{icon}</Box>
      <CardContent sx={{ gap: 0 }}>
        <Typography fontSize="sm" fontWeight="lg" color="primary">
          {label}
        </Typography>
        <Typography fontSize="xl" fontWeight="lg">
          {value}
        </Typography>
      </CardContent>
    </CardContent>
  </Card>
);

export default MetricCard;
