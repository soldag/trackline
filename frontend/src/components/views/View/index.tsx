import { PropsWithChildren } from "react";

import { Box, CircularProgress, Sheet } from "@mui/joy";

import AppBar, { AppBarProps } from "./components/AppBar";

interface ViewProps {
  appBar?: AppBarProps;
  disablePadding?: boolean;
  disableScrolling?: boolean;
  loading?: boolean;
}

const View = ({
  appBar,
  disablePadding = false,
  disableScrolling = false,
  loading = false,
  children,
}: PropsWithChildren<ViewProps>) => (
  <Sheet
    sx={{
      height: "100dvh",
      width: "100dvw",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      overscrollBehavior: "none",
      boxSizing: "border-box",
    }}
  >
    {appBar && <AppBar {...appBar} />}

    {loading ? (
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "calc(100% - 66px)",
          top: "66px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffffb0",
        }}
      >
        <CircularProgress size="lg" thickness={6} />
      </Box>
    ) : (
      <Box
        sx={{
          "display": "flex",
          "flexDirection": "column",
          "flexGrow": 1,
          ...(!disablePadding && { padding: 2 }),
          ...(!disableScrolling && { overflowY: "auto" }),
          "& > *": {
            flexGrow: 1,
          },
        }}
      >
        {children}
      </Box>
    )}
  </Sheet>
);

export default View;
