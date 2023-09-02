import _ from "lodash";
import PropTypes from "prop-types";

import FlagIcon from "@mui/icons-material/Flag";

import { GuessType, TurnType } from "~/types/games";

const TimeToGuess = ({ turn, userId, guess }) => {
  if (userId === turn.activeUserId) {
    return <FlagIcon color="success" />;
  }

  if (!guess) {
    return "-";
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
  userId: PropTypes.string.isRequired,
  guess: GuessType,
};

export default TimeToGuess;
