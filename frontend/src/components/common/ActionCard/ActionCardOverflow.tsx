import { PropsWithChildren } from "react";

import { CardOverflow } from "@mui/joy";

const ActionCardOverflow = ({ children }: PropsWithChildren) => (
  <CardOverflow
    sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      fontSize: "2rem",
    }}
  >
    {children}
  </CardOverflow>
);

export default ActionCardOverflow;
