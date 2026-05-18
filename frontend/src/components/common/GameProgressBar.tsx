import { FormattedMessage } from "react-intl";

import { Box, Stack, Typography } from "@mui/joy";
import { SxProps } from "@mui/joy/styles/types";

import { Game } from "@/types/games";
import { User } from "@/types/users";

interface GameProgressBarProps {
  game: Game;
  users: User[];
  sx?: SxProps;
}

const GameProgressBar = ({ game, users, sx }: GameProgressBarProps) => {
  const turn = game.turns.at(-1);
  if (!turn) {
    return null;
  }

  const roundTurnUserIds = new Set(
    game.turns
      .filter((t) => t.roundNumber === turn.roundNumber)
      .map((t) => t.activeUserId),
  );
  const roundTurnNumber = roundTurnUserIds.size;
  const roundTotalTurns = game.players.filter(
    (p) => !p.hasLeft || roundTurnUserIds.has(p.userId),
  ).length;

  const activeUser = users.find((u) => u.id === turn.activeUserId);

  return (
    <Box sx={sx}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography level="title-sm" fontWeight="lg">
            <FormattedMessage
              id="GameProgressBar.roundNumber"
              defaultMessage="Round {current}"
              values={{ current: turn.roundNumber }}
            />
          </Typography>
          <Typography level="body-xs" textColor="text.secondary">
            <FormattedMessage
              id="GameProgressBar.turnNumber"
              defaultMessage="Turn {current}/{total}"
              values={{ current: roundTurnNumber, total: roundTotalTurns }}
            />
          </Typography>
        </Box>

        {activeUser && (
          <Box sx={{ textAlign: "right" }}>
            <Typography level="title-sm" fontWeight="lg">
              <FormattedMessage
                id="GameProgressBar.activePlayer"
                defaultMessage="Active player"
              />
            </Typography>
            <Typography level="body-xs" textColor="text.secondary">
              {activeUser?.username}
            </Typography>
          </Box>
        )}
      </Stack>

      <Stack direction="row" spacing={0.5} sx={{ py: 1 }}>
        {Array.from({ length: roundTotalTurns }, (_, i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              height: 3,
              borderRadius: "lg",
              bgcolor:
                i < roundTurnNumber ? "primary.500" : "neutral.outlinedBorder",
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default GameProgressBar;
