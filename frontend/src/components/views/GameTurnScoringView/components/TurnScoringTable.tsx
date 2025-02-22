import * as _ from "lodash-es";
import React from "react";
import { FormattedMessage } from "react-intl";

import TimerIcon from "@mui/icons-material/Timer";
import { Box } from "@mui/joy";
import type { SxProps } from "@mui/joy/styles/types";

import ShadowTable from "@/components/common/ShadowTable";
import { Guess, Player, Turn } from "@/types/games";
import { User } from "@/types/users";

import TimeToGuess from "./TimeToGuess";

interface TurnScoringTableProps<TGuess extends Guess, TColumns extends string> {
  sx?: SxProps;
  players?: Player[];
  users?: User[];
  turn?: Turn;
  headers: Record<TColumns, React.ReactNode>;
  cellRenderers: Record<TColumns, (guess?: TGuess) => React.ReactNode>;
  guessSelector: (turn: Turn) => TGuess[];
}

const TurnScoringTable = <TGuess extends Guess, TColumns extends string>({
  sx,
  players = [],
  users = [],
  turn,
  headers,
  cellRenderers,
  guessSelector,
}: TurnScoringTableProps<TGuess, TColumns>) => {
  const mergedPlayers = players.map((p) => ({
    ...p,
    username: users.find((u) => u.id === p.userId)?.username,
    guess: turn
      ? guessSelector(turn).find((g) => g.userId === p.userId)
      : undefined,
  }));

  const { activeUserId } = turn ?? {};
  const sortedPlayers = _.orderBy(
    mergedPlayers,
    [
      (p) => p.userId === activeUserId,
      (p) => (p.guess?.creationTime ? Date.parse(p.guess?.creationTime) : null),
    ],
    ["desc", "asc"],
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
            <th key={key}>{content as React.ReactNode}</th>
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
              <td key={key}>
                {cellRenderers[key as TColumns]?.(player.guess)}
              </td>
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

export default TurnScoringTable;
