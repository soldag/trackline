import { PropsWithChildren } from "react";

import { Stack } from "@mui/joy";

const ButtonFooter = ({ children }: PropsWithChildren) => (
  <Stack
    direction={{ xs: "column", sm: "row" }}
    spacing={2}
    sx={{
      "& > *": {
        flex: "1 1 0",
      },
    }}
  >
    {children}
  </Stack>
);

export default ButtonFooter;
