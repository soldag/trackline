import _ from "lodash";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";

import TimerIcon from "@mui/icons-material/Timer";
import { Box } from "@mui/joy";

import ShadowTable from "@/components/common/ShadowTable";
import { PlayerType, TurnType } from "@/types/games";
import SxType from "@/types/mui";
import { UserType } from "@/types/users";

import TimeToGuess from "./TimeToGuess";

const TurnScoringTable = ({
  sx,
  players,
  users,
  turn,
  guessType,
  headers,
  cellRenderers,
}) => {
  const { activeUserId, guesses } = turn;

  const mergedPlayers = players.map((p) => ({
    ...p,
    username: users.find((u) => u.id === p.userId)?.username,
    guess: guesses[guessType].find((g) => g.userId === p.userId),
  }));

  const sortedPlayers = _.orderBy(
    mergedPlayers,
    [
      (p) => p.userId === activeUserId,
      (p) => Date.parse(p.guess?.creationTime),
    ],
    ["desc", "desc", "asc"],
  );

  return (
    <ShadowTable
      stickyHeader
      sx={{
        ...sx,
        "& th,td": {
          "&:first-of-type": { pl: 2 },
          "&:last-of-type": {
            pr: 2,
            display: { xs: "none", sm: "table-cell" },
          },
        },
      }}
    >
      <thead>
        <tr>
          <th>
            <FormattedMessage
              id="GameTurnScoringView.TurnScoringTable.header.player"
              defaultMessage="Player"
            />
          </th>
          {Object.entries(headers).map(([key, content]) => (
            <th key={key}>{content}</th>
          ))}
          <th>
            <TimerIcon />
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
            <td>{player.username}</td>
            {Object.keys(headers).map((key) => (
              <td key={key}>{cellRenderers[key]?.(player.guess)}</td>
            ))}
            <td>
              <TimeToGuess
                turn={turn}
                userId={player.userId}
                guess={player.guess}
              />
            </td>
          </Box>
        ))}
      </tbody>
    </ShadowTable>
  );
};

TurnScoringTable.propTypes = {
  players: PropTypes.arrayOf(PlayerType).isRequired,
  users: PropTypes.arrayOf(UserType).isRequired,
  turn: TurnType.isRequired,
  guessType: PropTypes.string.isRequired,
  headers: PropTypes.objectOf(PropTypes.node).isRequired,
  cellRenderers: PropTypes.objectOf(PropTypes.func).isRequired,
  sx: SxType,
};

export default TurnScoringTable;
