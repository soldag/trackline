import * as _ from "lodash-es";

import FlagIcon from "@mui/icons-material/Flag";

import { Guess, Turn } from "@/types/games";

interface TimeToGuess {
  turn?: Turn;
  userId?: string;
  guess?: Guess;
}

const TimeToGuess = ({ turn, userId, guess }: TimeToGuess) => {
  if (userId === turn?.activeUserId) {
    return <FlagIcon color="success" />;
  }

  if (!turn || !guess) {
    return "-";
  }

  const guessTime = Date.parse(guess.creationTime);
  const turnTime = Date.parse(turn.creationTime);
  const totalSeconds = (guessTime - turnTime) / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);

  return `${_.padStart(minutes.toString(), 2, "0")}:${_.padStart(seconds.toString(), 2, "0")}`;
};

export default TimeToGuess;
