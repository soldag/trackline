import _ from "lodash";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";

import FlagIcon from "@mui/icons-material/Flag";
import TimerIcon from "@mui/icons-material/Timer";
import TokenIcon from "@mui/icons-material/Token";
import WebStoriesIcon from "@mui/icons-material/WebStories";
import { Box, Typography } from "@mui/material";

import NumericDelta from "components/common/NumericDelta";
import ShadowTable from "components/common/ShadowTable";
import YearRange from "components/common/YearRange";
import { GuessType, PlayerType, TrackType, TurnType } from "types/games";
import { UserType } from "types/users";
import { isValidGuess } from "utils/games";

const Result = ({ isCorrect, tracksDelta, tokensDelta, children }) => (
  <Typography
    fontSize="inherit"
    sx={{
      display: "flex",
      alignItems: "center",
      columnGap: 1,
      flexWrap: "wrap",
    }}
  >
    <Typography fontSize="inherit" color={isCorrect ? "success" : "danger"}>
      {children}
    </Typography>
    <Typography
      fontSize="inherit"
      sx={{
        display: "flex",
        alignItems: "center",
        columnGap: 1,
      }}
    >
      {tracksDelta != null && (
        <NumericDelta value={tracksDelta} icon={<WebStoriesIcon />} />
      )}
      {tokensDelta != null && (
        <NumericDelta value={tokensDelta} icon={<TokenIcon />} />
      )}
    </Typography>
  </Typography>
);

Result.propTypes = {
  isCorrect: PropTypes.bool,
  tracksDelta: PropTypes.number,
  tokensDelta: PropTypes.number,
  children: PropTypes.node,
};

const PositionResult = ({ turn, guess, timeline }) => {
  if (guess?.position == null || !timeline) {
    return "-";
  }

  const {
    track,
    scoring: {
      position: { winner, tokensDelta },
    },
  } = turn;

  const originalTimeline = timeline.filter(
    (t) => t.spotifyId !== track.spotifyId,
  );
  const minYear = originalTimeline[guess.position - 1]?.releaseYear;
  const maxYear = originalTimeline[guess.position]?.releaseYear;

  const isCorrect =
    (minYear == null || track.releaseYear >= minYear) &&
    (maxYear == null || track.releaseYear <= maxYear);
  const isWinner = winner == guess.userId;

  return (
    <Result
      isCorrect={isCorrect}
      tracksDelta={isWinner ? 1 : 0}
      tokensDelta={tokensDelta[guess.userId]}
    >
      <YearRange min={minYear} max={maxYear} />
    </Result>
  );
};

PositionResult.propTypes = {
  turn: TurnType.isRequired,
  guess: GuessType.isRequired,
  timeline: PropTypes.arrayOf(TrackType).isRequired,
};

const ReleaseYearResult = ({ turn, guess }) => {
  if (guess?.releaseYear == null) {
    return "-";
  }

  const {
    track,
    scoring: {
      releaseYear: { tokensDelta },
    },
  } = turn;

  const isCorrect = track.releaseYear === guess.releaseYear;

  return (
    <Result isCorrect={isCorrect} tokensDelta={tokensDelta[guess.userId]}>
      {guess.releaseYear}
    </Result>
  );
};

ReleaseYearResult.propTypes = {
  turn: TurnType.isRequired,
  guess: GuessType.isRequired,
};

const TimeToGuess = ({ turn, guess }) => {
  if (!isValidGuess(guess)) {
    return "-";
  }

  if (guess.userId === turn.activeUserId) {
    return <FlagIcon color="success" />;
  }

  const guessTime = Date.parse(guess.creationTime);
  const turnTime = Date.parse(turn.creationTime);
  const totalSeconds = (guessTime - turnTime) / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);

  return `${_.padStart(minutes, 2, 0)}:${_.padStart(seconds, 2, 0)}`;
};

TimeToGuess.propTypes = {
  turn: TurnType.isRequired,
  guess: GuessType,
};

const TurnScoringTable = ({ players, users, turn }) => {
  const { activeUserId, guesses } = turn;
  const timeline = players.find((p) => p.userId === activeUserId)?.timeline;

  const mergedPlayers = players.map((p) => ({
    ...p,
    username: users.find((u) => u.id === p.userId)?.username,
    guess: guesses.find((g) => g.userId === p.userId),
  }));
  const sortedPlayers = _.orderBy(
    mergedPlayers,
    [
      (p) => p.userId === activeUserId,
      (p) => isValidGuess(p.guess),
      (p) => Date.parse(p.guess?.creationTime),
    ],
    ["desc", "desc", "asc"],
  );

  return (
    <ShadowTable
      stickyHeader
      sx={{
        "& thead th:nth-of-type(1)": { width: "25%" },
        "& thead th:nth-of-type(2)": { width: "40%" },
        "& thead th:nth-of-type(3)": { width: "20%" },
        "& thead th:nth-of-type(4)": { width: "15%" },
        "& th,td": {
          "&:first-of-type": { pl: 2 },
          "&:last-of-type": { pr: 2 },
          "&:nth-of-type(4)": {
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
          <th>
            <FormattedMessage
              id="GameTurnScoringView.TurnScoringTable.header.position"
              defaultMessage="Position"
            />
          </th>
          <th>
            <FormattedMessage
              id="GameTurnScoringView.TurnScoringTable.header.releaseYear"
              defaultMessage="Year"
            />
          </th>
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
            <td>
              <PositionResult
                turn={turn}
                guess={player.guess}
                timeline={timeline}
              />
            </td>
            <td>
              <ReleaseYearResult turn={turn} guess={player.guess} />
            </td>
            <td>
              <TimeToGuess turn={turn} guess={player.guess} />
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
  turn: TurnType,
};

export default TurnScoringTable;
