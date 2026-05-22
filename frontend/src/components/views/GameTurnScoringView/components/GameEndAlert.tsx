import { FormattedMessage } from "react-intl";

import SportsScoreIcon from "@mui/icons-material/SportsScore";
import { Alert, Box, Typography } from "@mui/joy";

import { User } from "@/types/users";

interface GameEndAlertProps {
  winner?: User;
  canCatchUp: boolean;
  open?: boolean;
}

const GameEndAlert = ({
  winner,
  canCatchUp,
  open = false,
}: GameEndAlertProps) => {
  if (!open) return null;

  return (
    <Alert
      size="sm"
      variant="soft"
      color="warning"
      startDecorator={<SportsScoreIcon />}
      sx={{ alignItems: "flex-start" }}
    >
      <Box>
        <FormattedMessage
          id="GameTurnScoringView.GameEndAlert.header"
          defaultMessage="Game end triggered"
        />
        <Typography level="body-xs" color="warning">
          <FormattedMessage
            id="GameTurnScoringView.GameEndAlert.message.default"
            defaultMessage="{winner} is in the lead and could win the game after this turn."
            values={{ winner: winner?.username }}
          />{" "}
          {canCatchUp && (
            <FormattedMessage
              id="GameTurnScoringView.GameEndAlert.message.catchUp"
              defaultMessage="Use your tokens to catch up and push the game into overtime!"
            />
          )}
        </Typography>
      </Box>
    </Alert>
  );
};

export default GameEndAlert;
