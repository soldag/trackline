import PropTypes from "prop-types";

import { GAME_STATES } from "~/constants";

export const TrackType = PropTypes.shape({
  spotifyId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  artists: PropTypes.arrayOf(PropTypes.string).isRequired,
  releaseYear: PropTypes.number.isRequired,
  imageUrl: PropTypes.string.isRequired,
});

export const PlayerType = PropTypes.shape({
  userId: PropTypes.string.isRequired,
  isGameMaster: PropTypes.bool.isRequired,
  tokens: PropTypes.number.isRequired,
  timeline: PropTypes.arrayOf(TrackType).isRequired,
});

const GuessProps = {
  creationTime: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  tokenCost: PropTypes.number.isRequired,
};
export const GuessType = PropTypes.shape(GuessProps);

export const ReleaseYearGuessType = PropTypes.shape({
  ...GuessProps,
  position: PropTypes.number.isRequired,
  year: PropTypes.number.isRequired,
});

export const CreditsGuessType = PropTypes.shape({
  ...GuessProps,
  artists: PropTypes.arrayOf(PropTypes.string).isRequired,
  title: PropTypes.string.isRequired,
});

export const TurnPassType = PropTypes.shape({
  userId: PropTypes.string.isRequired,
  creationTime: PropTypes.string.isRequired,
});

export const TokenGainType = PropTypes.shape({
  refund: PropTypes.number.isRequired,
  rewardTheoretical: PropTypes.number.isRequired,
  rewardEffective: PropTypes.number.isRequired,
});

const ScoringProps = {
  winner: PropTypes.string,
  correctGuesses: PropTypes.arrayOf(PropTypes.string).isRequired,
  tokenGains: PropTypes.objectOf(TokenGainType).isRequired,
};
export const ScoringType = PropTypes.shape(ScoringProps);

export const ReleaseYearScoringType = PropTypes.shape({
  position: ScoringType.isRequired,
  year: ScoringType.isRequired,
});

export const CreditsScoringType = PropTypes.shape({
  ...ScoringProps,
  similarityScores: PropTypes.objectOf(PropTypes.number).isRequired,
});

export const TurnScoringType = PropTypes.shape({
  releaseYear: ReleaseYearScoringType,
  credits: CreditsScoringType,
});

export const TurnType = PropTypes.shape({
  creationTime: PropTypes.string.isRequired,
  activeUserId: PropTypes.string.isRequired,
  track: TrackType.isRequired,
  guesses: PropTypes.shape({
    releaseYear: PropTypes.arrayOf(ReleaseYearGuessType).isRequired,
    credits: PropTypes.arrayOf(CreditsGuessType).isRequired,
  }),
  passes: PropTypes.arrayOf(TurnPassType).isRequired,
  scoring: TurnScoringType,
  completedBy: PropTypes.arrayOf(PropTypes.string).isRequired,
});

export const GameSettingsType = PropTypes.shape({
  spotifyMarket: PropTypes.string.isRequired,
  playlistIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  initialTokens: PropTypes.number.isRequired,
  timelineLength: PropTypes.number.isRequired,
  guessTimeout: PropTypes.number.isRequired,
});

export const GameType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  creationTime: PropTypes.string.isRequired,
  settings: GameSettingsType.isRequired,
  state: PropTypes.oneOf(Object.values(GAME_STATES)).isRequired,
  turns: PropTypes.arrayOf(TurnType).isRequired,
  players: PropTypes.arrayOf(PlayerType).isRequired,
});
