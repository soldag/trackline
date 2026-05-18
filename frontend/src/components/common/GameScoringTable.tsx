import * as _ from "lodash-es";
import { PropsWithChildren } from "react";

import { Box, Sheet, Typography } from "@mui/joy";
import { SxProps } from "@mui/joy/styles/types";

import ScoringResult from "@/components/common/ScoringResult";
import StyledAvatar from "@/components/common/StyledAvatar";
import { Player, TokenGain, Turn } from "@/types/games";
import { User } from "@/types/users";
import { aggregateTokenGains } from "@/utils/games";
import { mergeSx } from "@/utils/style";

const getTracksDelta = (userId: string, turn?: Turn): number => {
  if (!turn?.scoring) {
    return 0;
  }

  return turn.scoring.releaseYear.position.winner === userId ? 1 : 0;
};

const getTokenCost = (userId: string, turn?: Turn): number => {
  if (!turn?.scoring) {
    return 0;
  }

  return Object.values(turn.guesses)
    .flat()
    .filter((g) => g.userId === userId)
    .map((g) => g.tokenCost)
    .reduce((acc, curr) => acc + curr, 0);
};

const getTokenGain = (userId: string, turn?: Turn): TokenGain | undefined => {
  if (!turn?.scoring) {
    return undefined;
  }

  return aggregateTokenGains(userId, turn.scoring);
};

const getPosition = (player: Player, players: Player[]) =>
  players.filter(
    (p) =>
      p.timeline.length > player.timeline.length ||
      (p.timeline.length == player.timeline.length && p.tokens > player.tokens),
  ).length + 1;

interface TableCellProps extends PropsWithChildren {
  sx?: SxProps;
}

const TableCell = ({ children, sx }: TableCellProps) => (
  <Box
    sx={mergeSx(
      {
        "display": "flex",
        "alignItems": "center",
        "overflow": "hidden",
        "py": 1.5,
        "px": 1,
        "&:first-child": {
          pl: 2,
        },
        "&:last-child": {
          pr: 2,
        },
        "typography": "body-sm",
      },
      sx,
    )}
  >
    {children}
  </Box>
);

interface GameScoringTableProps {
  players?: Player[];
  users?: User[];
  turn?: Turn;
}

const GameScoringTable = ({
  players = [],
  users = [],
  turn,
}: GameScoringTableProps) => {
  const mergedPlayers = players.map((p) => ({
    ...p,
    username: users.find((u) => u.id === p.userId)?.username,
    position: getPosition(p, players),
    tracksDelta: getTracksDelta(p.userId, turn),
    tokenCost: getTokenCost(p.userId, turn),
    tokenGain: getTokenGain(p.userId, turn),
  }));
  const sortedPlayers = _.sortBy(mergedPlayers, ["position"]);

  return (
    <Sheet
      variant="outlined"
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr auto auto",
        borderRadius: "sm",
      }}
    >
      {sortedPlayers.map((player, i) => (
        <Box
          key={player.userId}
          sx={{
            "display": "contents",
            "& > *": {
              ...(i > 0 && {
                borderTop: "1px solid",
                borderTopColor: "divider",
              }),
            },
          }}
        >
          <TableCell sx={{ gap: 1.5 }}>
            <StyledAvatar
              name={player.username}
              variant="beam"
              size={28}
              style={{ flexShrink: 0 }}
            />
            <Typography noWrap level="body-sm" fontWeight="lg">
              {player.username}
            </Typography>
          </TableCell>

          <TableCell>
            <ScoringResult
              tracks={player.timeline.length}
              tracksDelta={player.tracksDelta}
            />
          </TableCell>

          <TableCell>
            <ScoringResult
              tokens={player.tokens}
              tokenCost={player.tokenCost}
              tokenGain={player.tokenGain}
            />
          </TableCell>
        </Box>
      ))}
    </Sheet>
  );
};

export default GameScoringTable;
