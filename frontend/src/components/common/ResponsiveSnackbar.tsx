import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  IconButton,
  Snackbar,
  SnackbarOrigin,
  SnackbarProps,
  Typography,
} from "@mui/joy";

import { useBreakpoint } from "@/utils/hooks";
import { mergeSx } from "@/utils/style";

interface ResponsiveSnackbarProps extends Omit<
  SnackbarProps,
  "endDecorator" | "anchorOrigin" | "children"
> {
  header?: React.ReactNode;
  message?: React.ReactNode;
  anchorOrigin?: Partial<SnackbarOrigin>;
  onClose?: () => void;
}

const ResponsiveSnackbar = ({
  sx,
  color,
  header,
  message,
  anchorOrigin,
  onClose,
  ...remainingProps
}: ResponsiveSnackbarProps) => {
  const isScreenLg = useBreakpoint((breakpoints) => breakpoints.up("lg"));

  return (
    <Snackbar
      {...remainingProps}
      color={color}
      endDecorator={
        <IconButton variant="soft" color={color} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      }
      anchorOrigin={{
        vertical: "bottom",
        horizontal: isScreenLg ? "right" : "center",
        ...anchorOrigin,
      }}
      sx={mergeSx(sx, {
        minWidth: "min(calc(100vw - 2.5rem), 400px)",
        maxWidth: "500px",
      })}
      onClose={onClose}
    >
      <Box>
        <Typography level="title-md" sx={{ color: "inherit" }}>
          {header}
        </Typography>
        <Typography level="body-sm" sx={{ color: "inherit" }}>
          {message}
        </Typography>
      </Box>
    </Snackbar>
  );
};

export default ResponsiveSnackbar;
