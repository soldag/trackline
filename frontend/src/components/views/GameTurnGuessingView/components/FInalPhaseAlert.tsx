import { FormattedMessage } from "react-intl";

import SportsScoreIcon from "@mui/icons-material/SportsScore";
import { Box, Typography } from "@mui/joy";

import { Game } from "@/types/games";

interface FinalPhaseAlertProps {
  game: Game;
}

const FinalPhaseAlert = ({ game }: FinalPhaseAlertProps) => {
  const isFinalPhase = game.players.some(
    (p) => p.timeline.length >= game.settings.timelineLength,
  );

  if (!isFinalPhase) {
    return null;
  }

  return (
    <Box
      sx={{
        p: 1,
        flexGrow: 0,
        display: "flex",
        justifyContent: "center",
        color: "warning.softColor",
        backgroundColor: "warning.softBg",
        borderBottom: "1px solid",
        borderBottomColor: "warning.softColor",
      }}
    >
      <Typography
        level="title-sm"
        color="warning"
        fontWeight="bold"
        startDecorator={<SportsScoreIcon />}
      >
        <FormattedMessage
          id="GameTurnGuessingView.FinalPhaseAlert.title"
          defaultMessage="Final Phase"
        />
      </Typography>
    </Box>
  );
};

export default FinalPhaseAlert;
