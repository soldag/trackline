import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";

import { Typography } from "@mui/joy";

import ScoringResult from "~/components/common/ScoringResult";
import YearRange from "~/components/common/YearRange";
import { GuessType, PlayerType, TrackType, TurnType } from "~/types/games";
import { UserType } from "~/types/users";

import TurnScoringTable from "./TurnScoringTable";

const PositionResult = ({ turn, guess, timeline }) => {
  if (!guess || !timeline) {
    return "-";
  }

  const {
    track,
    scoring: {
      releaseYear: {
        position: { winner, correctGuesses, tokenGains },
      },
    },
  } = turn;

  const isCorrect = correctGuesses.includes(guess.userId);

  const isWinner = winner == guess.userId;
  const tracksDelta = isWinner ? 1 : 0;

  const originalTimeline = timeline.filter(
    (t) => t.spotifyId !== track.spotifyId,
  );
  const minYear = originalTimeline[guess.position - 1]?.releaseYear;
  const maxYear = originalTimeline[guess.position]?.releaseYear;

  return (
    <ScoringResult
      tracksDelta={tracksDelta}
      tokenCost={guess.tokenCost}
      tokenGain={tokenGains[guess.userId]}
    >
      <Typography color={isCorrect ? "success" : "danger"}>
        <YearRange min={minYear} max={maxYear} />
      </Typography>
    </ScoringResult>
  );
};

PositionResult.propTypes = {
  turn: TurnType.isRequired,
  guess: GuessType,
  timeline: PropTypes.arrayOf(TrackType).isRequired,
};

const ReleaseYearResult = ({ turn, guess }) => {
  if (!guess) {
    return "-";
  }

  const {
    scoring: {
      releaseYear: {
        year: { correctGuesses, tokenGains },
      },
    },
  } = turn;

  const isCorrect = correctGuesses.includes(guess.userId);

  return (
    <ScoringResult tokenGain={tokenGains[guess.userId]}>
      <Typography color={isCorrect ? "success" : "danger"}>
        {guess.year}
      </Typography>
    </ScoringResult>
  );
};

ReleaseYearResult.propTypes = {
  turn: TurnType.isRequired,
  guess: GuessType,
};

const ReleaseYearScoringTable = ({ players, users, turn }) => {
  const { activeUserId } = turn;
  const timeline = players.find((p) => p.userId === activeUserId)?.timeline;

  return (
    <TurnScoringTable
      guessType="releaseYear"
      players={players}
      users={users}
      turn={turn}
      sx={{
        "& thead th:nth-of-type(1)": { width: "25%" },
        "& thead th:nth-of-type(2)": { width: "40%" },
        "& thead th:nth-of-type(3)": { width: "20%" },
        "& thead th:nth-of-type(4)": { width: "15%" },
      }}
      headers={{
        position: (
          <FormattedMessage
            id="GameTurnScoringView.ReleaseYearScoringTable.header.position"
            defaultMessage="Position"
          />
        ),
        releaseYear: (
          <FormattedMessage
            id="GameTurnScoringView.ReleaseYearScoringTable.header.releaseYear"
            defaultMessage="Year"
          />
        ),
      }}
      cellRenderers={{
        position: (guess) => (
          <PositionResult turn={turn} guess={guess} timeline={timeline} />
        ),
        releaseYear: (guess) => (
          <ReleaseYearResult turn={turn} guess={guess} timeline={timeline} />
        ),
      }}
    />
  );
};

ReleaseYearScoringTable.propTypes = {
  players: PropTypes.arrayOf(PlayerType).isRequired,
  users: PropTypes.arrayOf(UserType).isRequired,
  turn: TurnType,
};

export default ReleaseYearScoringTable;
