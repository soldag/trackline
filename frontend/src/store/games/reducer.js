import { createReducer, isAnyOf } from "@reduxjs/toolkit";

import {
  GAME_STATES,
  TOKEN_COST_BUY_TRACK,
  TOKEN_COST_EXCHANGE_TRACK,
} from "constants";
import { resetState } from "store/common/actions";
import {
  isFailure,
  isFulfill,
  isSuccess,
  isTrigger,
} from "store/utils/matchers";

import * as actions from "./actions";

const {
  abortGame,
  buyTrack,
  clearGame,
  completeTurn,
  createGame,
  createTurn,
  exchangeTrack,
  fetchGame,
  fetchGameUsers,
  gameAborted,
  gameStarted,
  guessTrack,
  joinGame,
  leaveGame,
  playerJoined,
  playerLeft,
  scoreTurn,
  startGame,
  trackBought,
  trackExchanged,
  trackGuessed,
  turnCompleted,
  turnCreated,
  turnScored,
} = actions;

const initialState = {
  loading: false,
  error: null,
  game: null,
  users: [],
};

const getTrackPosition = (timeline, track) => {
  let position = timeline.findIndex((t) => t.releaseYear > track.releaseYear);
  return position < 0 ? timeline.length : position;
};

const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(resetState, () => initialState)

    .addCase(clearGame, (state) => {
      state.game = null;
      state.users = [];
    })

    .addCase(playerJoined, (state, { payload: { user, player } }) => {
      state.game.players = [
        ...state.game.players.filter((p) => p.userId !== player.userId),
        player,
      ];
      state.users = [...state.users.filter((u) => u.id !== user.id), user];
    })

    .addCase(playerLeft, (state, { payload: { userId, newTurn } }) => {
      state.game.players = state.game.players.filter(
        (p) => p.userId !== userId,
      );
      state.users = state.users.filter((u) => u.id !== userId);

      if (newTurn) {
        state.game.turns.splice(-1, 1, newTurn);
      }
    })

    .addCase(gameStarted, (state, { payload: { initialTracks } }) => {
      state.game.state = GAME_STATES.STARTED;
      state.game.players = state.game.players.map((player) => ({
        ...player,
        timeline: [initialTracks[player.userId]],
      }));
    })

    .addCase(gameAborted, (state) => {
      state.game.state = GAME_STATES.ABORTED;
    })

    .addMatcher(isTrigger(...Object.values(actions)), (state) => {
      state.loading = true;
      state.error = null;
    })

    .addMatcher(
      isSuccess(fetchGame, createGame, joinGame),
      (state, { payload: { game } }) => {
        state.game = game;
      },
    )

    .addMatcher(isSuccess(abortGame, leaveGame), (state) => {
      state.game = null;
      state.users = [];
    })

    .addMatcher(isSuccess(fetchGameUsers), (state, { payload: { users } }) => {
      state.users = users;
    })

    .addMatcher(isSuccess(startGame), (state, { payload: { game, turn } }) => {
      state.game = {
        ...game,
        state: GAME_STATES.GUESSING,
        turns: [turn],
      };
    })

    .addMatcher(
      isAnyOf(isSuccess(createTurn), turnCreated),
      (state, { payload: { turn } }) => {
        state.game.state = GAME_STATES.GUESSING;
        state.game.turns.push(turn);
      },
    )

    .addMatcher(
      isAnyOf(isSuccess(guessTrack), trackGuessed),
      (state, { payload: { guess } }) => {
        const turn = state.game.turns.at(-1);
        turn.guesses = [
          ...turn.guesses.filter(({ userId }) => userId !== guess.userId),
          guess,
        ];
      },
    )

    .addMatcher(
      isAnyOf(isSuccess(scoreTurn), turnScored),
      (state, { payload: { scoring } }) => {
        const { position: positionScoring, releaseYear: releaseYearScoring } =
          scoring;

        state.game.state = GAME_STATES.SCORING;

        const turn = state.game.turns.at(-1);
        turn.scoring = scoring;

        for (const player of state.game.players) {
          const { userId } = player;
          player.tokens += positionScoring.tokensDelta[userId] || 0;
          player.tokens += releaseYearScoring.tokensDelta[userId] || 0;

          if (userId === positionScoring.winner) {
            const position =
              userId === turn.activeUserId
                ? turn.guesses.find((g) => g.userId === userId)?.position
                : getTrackPosition(player.timeline, turn.track);

            if (position != null) {
              player.timeline.splice(position, 0, turn.track);
            }
          }
        }
      },
    )

    .addMatcher(
      isAnyOf(isSuccess(completeTurn), turnCompleted),
      (state, { payload: { userId, completion } }) => {
        const turn = state.game.turns.at(-1);
        if (!turn.completedBy.includes(userId)) {
          turn.completedBy.push(userId);
        }

        if (completion.gameCompleted) {
          state.game.state = GAME_STATES.COMPLETED;
        }
      },
    )

    .addMatcher(
      isAnyOf(isSuccess(buyTrack), trackBought),
      (state, { payload }) => {
        const { userId, track, gameCompleted } = payload.receipt || payload;

        if (gameCompleted) {
          state.game.state = GAME_STATES.COMPLETED;
        }

        const player = state.game.players.find((p) => p.userId === userId);
        if (player) {
          const position = getTrackPosition(player.timeline, track);
          player.timeline.splice(position, 0, track);

          player.tokens -= TOKEN_COST_BUY_TRACK;
        }
      },
    )

    .addMatcher(
      isAnyOf(isSuccess(exchangeTrack), trackExchanged),
      (state, { payload: { track } }) => {
        const turn = state.game.turns.at(-1);
        turn.track = track;
        turn.guesses = [];

        const activePlayer = state.game.players.find(
          (p) => p.userId === turn.activeUserId,
        );
        if (activePlayer) {
          activePlayer.tokens -= TOKEN_COST_EXCHANGE_TRACK;
        }
      },
    )

    .addMatcher(
      isFailure(...Object.values(actions)),
      (state, { payload: { error } }) => {
        state.error = error;
      },
    )

    .addMatcher(isFulfill(...Object.values(actions)), (state) => {
      state.loading = false;
    });
});

export default reducer;
