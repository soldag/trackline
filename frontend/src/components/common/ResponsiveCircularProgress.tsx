import useResizeObserver from "@react-hook/resize-observer";
import { useRef, useState } from "react";

import { Box, CircularProgress, CircularProgressProps } from "@mui/joy";

const MIN_THICKNESS = 8;
const THICKNESS_FACTOR = 0.06;

const ResponsiveCircularProgress = (props: CircularProgressProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0);

  useResizeObserver(ref, (entry) => {
    const { height, width } = entry.contentRect;
    setSize(Math.min(height, width));
  });

  const thickness = Math.min(MIN_THICKNESS, size * THICKNESS_FACTOR);

  return (
    <Box
      ref={ref}
      sx={{
        "minHeight": "100%",
        "minWidth": "100%",
        "overflow": "hidden",
        "--CircularProgress-size": `${size}px`,
        "--CircularProgress-trackThickness": `${thickness}px`,
        "--CircularProgress-progressThickness": `${thickness}px`,
      }}
    >
      <CircularProgress {...props} />
    </Box>
  );
};

export default ResponsiveCircularProgress;
