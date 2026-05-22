import { FormattedMessage } from "react-intl";

import WarningIcon from "@mui/icons-material/Warning";
import { Alert, Box, Typography } from "@mui/joy";

interface MaxTokenAlertProps {
  limit: number;
  open?: boolean;
}

const MaxTokenAlert = ({ limit, open = false }: MaxTokenAlertProps) => {
  if (!open) return null;

  return (
    <Alert
      variant="soft"
      color="warning"
      startDecorator={<WarningIcon />}
      sx={{ alignItems: "flex-start" }}
    >
      <Box>
        <FormattedMessage
          id="GameTurnScoringView.MaxTokenAlert.header"
          defaultMessage="Token limit reached"
        />
        <Typography level="body-xs" color="warning">
          <FormattedMessage
            id="GameTurnScoringView.MaxTokenAlert.message"
            defaultMessage="You cannot have more than {limit, plural, =1 {#{nbsp}token} other {#{nbsp}tokens}}. You should spend some for buying a track."
            values={{ limit, nbsp: " " }}
          />
        </Typography>
      </Box>
    </Alert>
  );
};

export default MaxTokenAlert;
