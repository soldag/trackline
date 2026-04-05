import { FormattedMessage } from "react-intl";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import ResponsiveSnackbar from "@/components/common/ResponsiveSnackbar";
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
  const { remaining } = useCountdown({ start: timeoutStart, end: timeoutEnd });

  return (
    <ResponsiveSnackbar
      open={open}
      variant="soft"
      color="warning"
      anchorOrigin={{ vertical: "top" }}
      startDecorator={<WarningAmberIcon />}
      header={
        <FormattedMessage
          id="GameTurnGuessingView.CountdownSnackbar.header"
          defaultMessage="Your time is running out"
        />
      }
      message={
        <FormattedMessage
          id="GameTurnGuessingView.CountdownSnackbar.remainingTime"
          defaultMessage="You only have {seconds}s left to guess."
          values={{
            seconds: Math.floor(remaining / 1000),
          }}
        />
      }
      onClose={onClose}
    />
  );
};

export default CountdownSnackbar;
