import PropTypes from "prop-types";
import { useRef } from "react";

import { Box } from "@mui/joy";

import SxType from "@/types/mui";
import { useEventListener } from "@/utils/hooks";

const TimelineContainer = ({ sx, children }) => {
  const ref = useRef();

  useEventListener(ref.current, "wheel", (e) => {
    const element = ref.current;
    if (!element) return;

    const { clientWidth, scrollWidth } = element;
    if (clientWidth < scrollWidth) {
      e.preventDefault();
      ref.current.scrollLeft += e.deltaY + e.deltaX;
    }
  });

  return (
    <Box
      ref={ref}
      sx={[
        sx,
        {
          "display": "flex",
          "flexGrow": 1,
          "justifyContent": { xs: "center", sm: "unset" },
          "alignItems": { sm: "center" },
          "overflow": "auto",
          "WebkitOverflowScrolling": "touch",
          "msOverflowStyle": "none",
          "scrollbarWidth": "none",
          "&::-webkit-scrollbar": { display: "none" },
        },
      ]}
    >
      <Box>{children}</Box>
    </Box>
  );
};

TimelineContainer.propTypes = {
  sx: SxType,
  children: PropTypes.node,
};

export default TimelineContainer;
