import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";

import { Typography } from "@mui/joy";

import ScoringResult from "~/components/common/ScoringResult";
import { GuessType, PlayerType, TurnType } from "~/types/games";
import { UserType } from "~/types/users";

import TurnScoringTable from "./TurnScoringTable";

const CreditsResult = ({ turn, guess }) => {
  if (!guess) {
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

CreditsResult.propTypes = {
  turn: TurnType.isRequired,
  guess: GuessType,
};

const CreditsScoringTable = ({ players, users, turn }) => (
  <TurnScoringTable
    guessType="credits"
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
      credits: (guess) => <CreditsResult turn={turn} guess={guess} />,
    }}
  />
);

CreditsScoringTable.propTypes = {
  players: PropTypes.arrayOf(PlayerType).isRequired,
  users: PropTypes.arrayOf(UserType).isRequired,
  turn: TurnType,
};

export default CreditsScoringTable;
