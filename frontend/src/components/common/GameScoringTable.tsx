import { PropsWithChildren } from "react";

import { Box, Sheet, Typography } from "@mui/joy";
import { SxProps } from "@mui/joy/styles/types";

import ScoringResult from "@/components/common/ScoringResult";
import UserAvatar from "@/components/common/UserAvatar";
import { Player, TokenGain, Turn } from "@/types/games";
import { User } from "@/types/users";
import { aggregateTokenGains, sortPlayersByRank } from "@/utils/games";
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
  showRank?: boolean;
}

const GameScoringTable = ({
  players = [],
  users = [],
  turn,
  showRank = false,
}: GameScoringTableProps) => {
  const sortedPlayers = sortPlayersByRank(players).map((p) => ({
    ...p,
    username: users.find((u) => u.id === p.userId)?.username,
    tracksDelta: getTracksDelta(p.userId, turn),
    tokenCost: getTokenCost(p.userId, turn),
    tokenGain: getTokenGain(p.userId, turn),
  }));

  return (
    <Sheet
      variant="outlined"
      sx={{
        display: "grid",
        gridTemplateColumns: showRank ? "auto 1fr auto auto" : "1fr auto auto",
        borderRadius: "sm",
        width: "100%",
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
          {showRank && <TableCell>{player.rank}</TableCell>}

          <TableCell sx={{ gap: 1.5 }}>
            <UserAvatar
              username={player.username ?? ""}
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
