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

export const GuessType = PropTypes.shape({
  creationTime: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  position: PropTypes.number,
  releaseYear: PropTypes.number,
});

export const CategoryScoringType = PropTypes.shape({
  winner: PropTypes.string,
  tokensDelta: PropTypes.objectOf(PropTypes.number).isRequired,
});

export const TurnScoringType = PropTypes.shape({
  position: CategoryScoringType,
  releaseYear: CategoryScoringType,
});

export const TurnType = PropTypes.shape({
  creationTime: PropTypes.string.isRequired,
  activeUserId: PropTypes.string.isRequired,
  track: TrackType.isRequired,
  guesses: PropTypes.arrayOf(GuessType).isRequired,
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
