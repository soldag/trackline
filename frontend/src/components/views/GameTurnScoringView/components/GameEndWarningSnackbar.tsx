import { FormattedMessage } from "react-intl";

import SportsScoreIcon from "@mui/icons-material/SportsScore";

import ResponsiveSnackbar from "@/components/common/ResponsiveSnackbar";
import { User } from "@/types/users";

interface GameEndWarningSnackbarProps {
  winner?: User;
  canCatchUp: boolean;
  open?: boolean;
  onClose?: () => void;
}

const GameEndWarningSnackbar = ({
  winner,
  canCatchUp,
  open = false,
  onClose,
}: GameEndWarningSnackbarProps) => (
  <ResponsiveSnackbar
    open={open}
    variant="soft"
    color="warning"
    autoHideDuration={canCatchUp ? null : 3500}
    startDecorator={<SportsScoreIcon />}
    header={
      <FormattedMessage
        id="GameTurnScoringView.GameEndWarningSnackbar.header"
        defaultMessage="Game end triggered"
      />
    }
    message={
      <>
        <FormattedMessage
          id="GameTurnScoringView.GameEndWarningSnackbar.message.default"
          defaultMessage="{winner} is in the lead and could win the game after this turn."
          values={{ winner: winner?.username }}
        />{" "}
        {canCatchUp && (
          <FormattedMessage
            id="GameTurnScoringView.GameEndWarningSnackbar.message.catchUp"
            defaultMessage="Use your tokens to catch up and push the game into overtime!"
          />
        )}
      </>
    }
    onClose={onClose}
  />
);

export default GameEndWarningSnackbar;
