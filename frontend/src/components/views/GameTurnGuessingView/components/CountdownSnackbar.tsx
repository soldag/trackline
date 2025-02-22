import { FormattedMessage } from "react-intl";
import { useMediaQuery } from "react-responsive";

import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Box, IconButton, Snackbar, Typography } from "@mui/joy";

import { useCountdown } from "@/utils/hooks";

interface CountdownSnackbarProps {
  open?: boolean;
  timeoutStart?: number;
  timeoutEnd?: number;
  onClose?: () => void;
}

const CountdownSnackbar = ({
  open = false,
  timeoutStart,
  timeoutEnd,
  onClose,
}: CountdownSnackbarProps) => {
  const hasSmallHeight = useMediaQuery({ query: "(max-height: 550px)" });
  const { remaining } = useCountdown({ start: timeoutStart, end: timeoutEnd });

  return (
    <Snackbar
      open={open}
      variant="soft"
      color="warning"
      startDecorator={<WarningAmberIcon />}
      endDecorator={
        <IconButton variant="soft" color="warning" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      }
      anchorOrigin={{
        vertical: "top",
        horizontal: hasSmallHeight ? "right" : "center",
      }}
      sx={{
        minWidth: "min(calc(100vw - 2.5rem), 400px)",
        maxWidth: "500px",
      }}
    >
      <Box>
        <Typography level="title-md" sx={{ color: "inherit" }}>
          <FormattedMessage
            id="GameTurnGuessingView.CountdownSnackbar.header"
            defaultMessage="Your time is running out"
          />
        </Typography>
        <Typography level="body-sm" sx={{ color: "inherit" }}>
          <FormattedMessage
            id="GameTurnGuessingView.CountdownSnackbar.remainingTime"
            defaultMessage="You only have {seconds}s left to guess."
            values={{
              seconds: Math.floor(remaining / 1000),
            }}
          />
        </Typography>
      </Box>
    </Snackbar>
  );
};

export default CountdownSnackbar;
