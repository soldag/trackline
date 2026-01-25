import { createAction } from "@reduxjs/toolkit";

import {
  CorrectionProposal,
  CorrectionProposalState,
  CorrectionProposalVote,
  CreditsGuess,
  Player,
  ReleaseYearGuess,
  Track,
  Turn,
  TurnPass,
  TurnScoring,
} from "@/types/games";
import { User } from "@/types/users";

import { PREFIX } from "./constants";

export const clearGame = createAction(`${PREFIX}/clearGame`);
export const clearBoughtTrack = createAction(`${PREFIX}/clearBoughtTrack`);
export const enableBuyTrackReminder = createAction(
  `${PREFIX}/enableBuyTrackReminder`,
);
export const disableBuyTrackReminder = createAction(
  `${PREFIX}/disableBuyTrackReminder`,
);

interface PlayerJoinedPayload {
  user: User;
  player: Player;
  position: number;
}
export const playerJoined = createAction<PlayerJoinedPayload>(
  `${PREFIX}/playerAdded`,
);

interface PlayerLeftPayload {
  userId: string;
  newTurn: Turn;
}
export const playerLeft = createAction<PlayerLeftPayload>(
  `${PREFIX}/playerRemoved`,
);
interface GameStartedPayload {
  initialTracks: { [userId: string]: Track };
}
export const gameStarted = createAction<GameStartedPayload>(
  `${PREFIX}/started`,
);

export const gameAborted = createAction(`${PREFIX}/aborted`);

interface TurnCreatedPayload {
  turn: Turn;
}
export const turnCreated = createAction<TurnCreatedPayload>(
  `${PREFIX}/turnCreated`,
);

interface TrackExchangedPayload {
  turnRevisionId: string;
  track: Track;
  tokenDelta: { [userId: string]: number };
}
export const trackExchanged = createAction<TrackExchangedPayload>(
  `${PREFIX}/trackExchanged`,
);

interface ReleaseYearGuessCreatedPayload {
  guess: ReleaseYearGuess;
}
export const releaseYearGuessCreated =
  createAction<ReleaseYearGuessCreatedPayload>(
    `${PREFIX}/releaseYearGuessCreated`,
  );

interface CreditsGuessCreatedPayload {
  guess: CreditsGuess;
}
export const creditsGuessCreated = createAction<CreditsGuessCreatedPayload>(
  `${PREFIX}/creditsGuessCreated`,
);
interface TurnPassedPayload {
  turnPass: TurnPass;
}
export const turnPassed = createAction<TurnPassedPayload>(
  `${PREFIX}/turnPassed`,
);

interface TurnScoredPayload {
  scoring: TurnScoring;
}
export const turnScored = createAction<TurnScoredPayload>(
  `${PREFIX}/turnScored`,
);

interface TurnCompletedPayload {
  userId: string;
  completion: {
    turnCompleted: boolean;
    gameCompleted: boolean;
  };
}
export const turnCompleted = createAction<TurnCompletedPayload>(
  `${PREFIX}/turnCompleted`,
);

interface TrackBoughtPayload {
  userId: string;
  track: Track;
}
export const trackBought = createAction<TrackBoughtPayload>(
  `${PREFIX}/trackBought`,
);

interface CorrectionProposedPayload {
  proposal: CorrectionProposal;
}
export const correctionProposed = createAction<CorrectionProposedPayload>(
  `${PREFIX}/correctionProposed`,
);

interface CorrectionVotedPayload {
  vote: CorrectionProposalVote;
  proposalState: CorrectionProposalState;
  scoring: TurnScoring | null;
}
export const correctionVoted = createAction<CorrectionVotedPayload>(
  `${PREFIX}/correctionVoted`,
);
