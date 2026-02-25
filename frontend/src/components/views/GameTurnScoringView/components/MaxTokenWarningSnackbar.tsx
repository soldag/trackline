import { FormattedMessage } from "react-intl";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import ResponsiveSnackbar from "@/components/common/ResponsiveSnackbar";

interface MaxTokenWarningSnackbarProps {
  limit: number;
  open?: boolean;
  onClose?: () => void;
}

const MaxTokenWarningSnackbar = ({
  limit,
  open = false,
  onClose,
}: MaxTokenWarningSnackbarProps) => (
  <ResponsiveSnackbar
    open={open}
    variant="soft"
    color="warning"
    startDecorator={<WarningAmberIcon />}
    header={
      <FormattedMessage
        id="GameTurnScoringView.MaxTokenWarningSnackbar.header"
        defaultMessage="Token limit reached"
      />
    }
    message={
      <FormattedMessage
        id="GameTurnScoringView.MaxTokenWarningSnackbar.message"
        defaultMessage="You cannot have more than {limit, plural, =1 {#{nbsp}token} other {#{nbsp}tokens}}. You should spend some for buying a track."
        values={{ limit, nbsp: "\u00a0" }}
      />
    }
    onClose={onClose}
  />
);

export default MaxTokenWarningSnackbar;
