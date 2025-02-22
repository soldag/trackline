import * as _ from "lodash-es";
import { FormattedMessage } from "react-intl";

import TokenIcon from "@mui/icons-material/Token";
import WebStoriesIcon from "@mui/icons-material/WebStories";
import { Box, Typography } from "@mui/joy";

import ScoringResult from "@/components/common/ScoringResult";
import ShadowTable from "@/components/common/ShadowTable";
import { Player, TokenGain, Turn } from "@/types/games";
import { User } from "@/types/users";
import { aggregateTokenGains } from "@/utils/games";

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
    <ShadowTable
      stickyHeader
      sx={{
        "& thead th:nth-of-type(1)": { width: "40px" },
        "& th:first-of-type, td:first-of-type": { pl: 2 },
        "& th:last-of-type, td:last-of-type": { pr: 2 },
      }}
    >
      <thead>
        <tr>
          <th>#</th>
          <th>
            <FormattedMessage
              id="GameScoringTable.header.player"
              defaultMessage="Player"
            />
          </th>
          <th>
            <FormattedMessage
              id="GameScoringTable.header.tracks"
              defaultMessage="Tracks"
            />
          </th>
          <th>
            <FormattedMessage
              id="GameScoringTable.header.tokens"
              defaultMessage="Tokens"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedPlayers.map((player) => (
          <Box
            component="tr"
            key={player.userId}
            sx={{
              "&:nth-of-type(odd)": {
                backgroundColor: "background.level1",
              },
            }}
          >
            <td>{player.position}.</td>
            <td>{player.username}</td>
            <td>
              <ScoringResult tracksDelta={player.tracksDelta}>
                <Typography endDecorator={<WebStoriesIcon />}>
                  {player.timeline.length}
                </Typography>
              </ScoringResult>
            </td>
            <td>
              <ScoringResult
                tokenCost={player.tokenCost}
                tokenGain={player.tokenGain}
              >
                <Typography endDecorator={<TokenIcon />}>
                  {player.tokens}
                </Typography>
              </ScoringResult>
            </td>
          </Box>
        ))}
      </tbody>
    </ShadowTable>
  );
};

export default GameScoringTable;
