import { FormattedMessage } from "react-intl";

import { Typography } from "@mui/joy";

import ScoringResult from "@/components/common/ScoringResult";
import { CreditsGuess, Player, Turn } from "@/types/games";
import { User } from "@/types/users";

import TurnScoringTable from "./TurnScoringTable";

interface CreditsResultProps {
  turn?: Turn;
  guess?: CreditsGuess;
}

const CreditsResult = ({ turn, guess }: CreditsResultProps) => {
  if (!guess || !turn) {
    return "-";
  }

  const {
    scoring: {
      credits: { correctGuesses, tokenGains },
    },
  } = turn;

  const isCorrect = correctGuesses.includes(guess.userId);

  return (
    <ScoringResult
      tokenCost={guess.tokenCost}
      tokenGain={tokenGains[guess.userId]}
    >
      <Typography color={isCorrect ? "success" : "danger"}>
        <Typography sx={{ display: "block" }}>{guess.title}</Typography>
        <Typography sx={{ display: "block" }}>
          {guess.artists.join(", ")}
        </Typography>
      </Typography>
    </ScoringResult>
  );
};

interface CreditsScoringTableProps {
  players?: Player[];
  users?: User[];
  turn?: Turn;
}

const CreditsScoringTable = ({
  players = [],
  users = [],
  turn,
}: CreditsScoringTableProps) => (
  <TurnScoringTable
    guessSelector={(t) => t.guesses.credits}
    players={players}
    users={users}
    turn={turn}
    sx={{
      "& thead th:nth-of-type(1)": { width: "25%" },
      "& thead th:nth-of-type(2)": { width: "60%" },
      "& thead th:nth-of-type(3)": { width: "15%" },
    }}
    headers={{
      credits: (
        <FormattedMessage
          id="GameTurnScoringView.CreditsScoringTable.header.credits"
          defaultMessage="Credits"
        />
      ),
    }}
    cellRenderers={{
      credits: (guess?: CreditsGuess) => (
        <CreditsResult turn={turn} guess={guess} />
      ),
    }}
  />
);

export default CreditsScoringTable;
