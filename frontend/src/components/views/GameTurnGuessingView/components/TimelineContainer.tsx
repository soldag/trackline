import { PropsWithChildren, useRef } from "react";

import { Box } from "@mui/joy";
import type { SxProps } from "@mui/joy/styles/types";

import { useEventListener } from "@/utils/hooks";
import { mergeSx } from "@/utils/style";

interface TimelineContainerProps {
  sx?: SxProps;
}

const TimelineContainer = ({
  sx = {},
  children,
}: PropsWithChildren<TimelineContainerProps>) => {
  const ref = useRef<HTMLDivElement>(null);

  useEventListener(ref.current, "wheel", (e: WheelEvent) => {
    const element = ref.current;
    if (!element) return;

    const { clientWidth, scrollWidth } = element;
    if (clientWidth < scrollWidth) {
      e.preventDefault();
      element.scrollLeft += e.deltaY + e.deltaX;
    }
  });

  return (
    <Box
      ref={ref}
      sx={mergeSx(sx, {
        "display": "flex",
        "flexGrow": 1,
        "justifyContent": { xs: "center", sm: "unset" },
        "alignItems": { sm: "center" },
        "overflow": "auto",
        "WebkitOverflowScrolling": "touch",
        "msOverflowStyle": "none",
        "scrollbarWidth": "none",
        "&::-webkit-scrollbar": { display: "none" },
      })}
    >
      <Box>{children}</Box>
    </Box>
  );
};

export default TimelineContainer;
