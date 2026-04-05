import { useMediaQuery } from "react-responsive";

import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  IconButton,
  Snackbar,
  SnackbarOrigin,
  SnackbarProps,
  Typography,
} from "@mui/joy";

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
  const hasSmallHeight = useMediaQuery({ query: "(max-height: 550px)" });

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
        horizontal: hasSmallHeight ? "right" : "center",
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
