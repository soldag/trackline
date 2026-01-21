import React from "react";

import { Typography } from "@mui/joy";

interface ActionCardTitleProps {
  title: React.ReactNode;
}

const ActionCardTitle = ({ title }: ActionCardTitleProps) => (
  <Typography
    level="title-lg"
    sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
  >
    {title}
  </Typography>
);

export default ActionCardTitle;
