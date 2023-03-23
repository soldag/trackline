import orderBy from "lodash/orderBy";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";

import TokenIcon from "@mui/icons-material/Token";
import WebStoriesIcon from "@mui/icons-material/WebStories";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";

import NumericDelta from "components/common/NumericDelta";
import ShadowTable from "components/common/ShadowTable";
import { PlayerType, TurnType } from "types/games";
import { UserType } from "types/users";

const getTracksDelta = (userId, turn) =>
  turn?.scoring?.position?.winner === userId ? 1 : 0;

const getTokensDelta = (userId, turn) =>
  Object.values(turn?.scoring || {})
    .filter((s) => s.tokensDelta != null)
    .map((s) => s.tokensDelta[userId] || 0)
    .reduce((acc, curr) => acc + curr, 0);

const GameScoringTable = ({ players, users, turn }) => {
  const mergedPlayers = players.map((p) => ({
    ...p,
    username: users.find((u) => u.id === p.userId)?.username,
    tracksDelta: getTracksDelta(p.userId, turn),
    tokensDelta: getTokensDelta(p.userId, turn),
  }));
  const sortedPlayers = orderBy(
    mergedPlayers,
    [(p) => p.timeline.length, (p) => p.tokens],
    ["desc", "desc"],
  );

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
        {sortedPlayers.map((player, i) => (
          <Box
            component="tr"
            key={player.userId}
            sx={{
              "&:nth-of-type(odd)": {
                backgroundColor: "background.level1",
              },
            }}
          >
            <td>{i + 1}</td>
            <td>{player.username}</td>
            <td>
              <Typography
                sx={{
                  display: "flex",
                  alignItems: "center",
                  columnGap: 1,
                }}
              >
                <Typography endDecorator={<WebStoriesIcon />}>
                  {player.timeline.length}
                </Typography>
                {player.tracksDelta > 0 && (
                  <NumericDelta
                    value={player.tracksDelta}
                    icon={<WebStoriesIcon />}
                  />
                )}
              </Typography>
            </td>
            <td>
              <Typography
                sx={{
                  display: "flex",
                  alignItems: "center",
                  columnGap: 1,
                }}
              >
                <Typography endDecorator={<TokenIcon />}>
                  {player.tokens}
                </Typography>
                {player.tokensDelta !== 0 && (
                  <NumericDelta
                    value={player.tokensDelta}
                    icon={<TokenIcon />}
                  />
                )}
              </Typography>
            </td>
          </Box>
        ))}
      </tbody>
    </ShadowTable>
  );
};

GameScoringTable.propTypes = {
  players: PropTypes.arrayOf(PlayerType).isRequired,
  users: PropTypes.arrayOf(UserType).isRequired,
  turn: TurnType,
};

export default GameScoringTable;
