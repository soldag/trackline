import { FormattedMessage } from "react-intl";

import { Typography } from "@mui/joy";

import ScoringResult from "@/components/common/ScoringResult";
import YearRange from "@/components/common/YearRange";
import { Player, ReleaseYearGuess, Track, Turn } from "@/types/games";
import { User } from "@/types/users";

import TurnScoringTable from "./TurnScoringTable";

interface PositionResultProps {
  turn?: Turn;
  guess?: ReleaseYearGuess;
  timeline?: Track[];
}

const PositionResult = ({ turn, guess, timeline }: PositionResultProps) => {
  if (!turn || !guess || !timeline) {
    return "-";
  }

  const {
    scoring: {
      releaseYear: {
        position: { winner, correctGuesses, tokenGains },
      },
    },
  } = turn;

  const isCorrect = correctGuesses.includes(guess.userId);

  const isWinner = winner == guess.userId;
  const tracksDelta = isWinner ? 1 : 0;

  const prevTrack = timeline.find((t) => t.spotifyId === guess.prevTrackId);
  const nextTrack = timeline.find((t) => t.spotifyId === guess.nextTrackId);

  return (
    <ScoringResult
      tracksDelta={tracksDelta}
      tokenCost={guess.tokenCost}
      tokenGain={tokenGains[guess.userId]}
    >
      <Typography color={isCorrect ? "success" : "danger"}>
        <YearRange min={prevTrack?.releaseYear} max={nextTrack?.releaseYear} />
      </Typography>
    </ScoringResult>
  );
};

interface ReleaseYearResultProps {
  turn?: Turn;
  guess?: ReleaseYearGuess;
}

const ReleaseYearResult = ({ turn, guess }: ReleaseYearResultProps) => {
  if (!turn || !guess) {
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

interface ReleaseYearScoringTableProps {
  players?: Player[];
  users?: User[];
  turn?: Turn;
}

const ReleaseYearScoringTable = ({
  players = [],
  users = [],
  turn,
}: ReleaseYearScoringTableProps) => {
  const { activeUserId } = turn ?? {};
  const timeline = players.find((p) => p.userId === activeUserId)?.timeline;

  return (
    <TurnScoringTable
      guessSelector={(t) => t.guesses.releaseYear}
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
        position: (guess?: ReleaseYearGuess) => (
          <PositionResult turn={turn} guess={guess} timeline={timeline} />
        ),
        releaseYear: (guess?: ReleaseYearGuess) => (
          <ReleaseYearResult turn={turn} guess={guess} />
        ),
      }}
    />
  );
};

export default ReleaseYearScoringTable;
