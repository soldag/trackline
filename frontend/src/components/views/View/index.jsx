import PropTypes from "prop-types";
import { useState } from "react";

import Box from "@mui/joy/Box";
import CircularProgress from "@mui/joy/CircularProgress";
import Sheet from "@mui/joy/Sheet";

import { useEventListener } from "utils/hooks";

import AppBar from "./components/AppBar";

const View = ({
  appBar,
  disablePadding = false,
  disableScrolling = false,
  loading = false,
  children,
}) => {
  const [height, setHeight] = useState("100vh");

  useEventListener(window, "resize", () => {
    if (!window.visualViewport) return;

    setHeight(`${window.visualViewport.height}px`);
  });

  return (
    <Sheet
      sx={{
        height,
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        overscrollBehavior: "none",
        boxSizing: "border-box",
      }}
    >
      {appBar && <AppBar {...appBar} />}

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

      {loading && (
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
      )}
    </Sheet>
  );
};

View.propTypes = {
  appBar: PropTypes.shape({
    showTitle: PropTypes.bool,
    showPlayerInfo: PropTypes.bool,
    showPlaybackControls: PropTypes.bool,
    showExitGame: PropTypes.bool,
    showLogout: PropTypes.bool,
  }),
  disablePadding: PropTypes.bool,
  disableScrolling: PropTypes.bool,
  loading: PropTypes.bool,
  children: PropTypes.node,
};

export default View;
