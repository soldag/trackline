import { createReducer, isAnyOf } from "@reduxjs/toolkit";

import { GAME_STATES, TOKEN_COST_BUY_TRACK } from "~/constants";
import { resetState } from "~/store/common/actions";
import { isSuccess } from "~/store/utils/matchers";
import { getTotalTokenGain } from "~/utils/games";

import {
  abortGame,
  buyTrack,
  clearGame,
  completeTurn,
  createGame,
  createTurn,
  creditsGuessCreated,
  exchangeTrack,
  fetchGame,
  fetchGameUsers,
  gameAborted,
  gameStarted,
  guessTrackCredits,
  guessTrackReleaseYear,
  joinGame,
  leaveGame,
  passTurn,
  playerJoined,
  playerLeft,
  releaseYearGuessCreated,
  scoreTurn,
  startGame,
  trackBought,
  trackExchanged,
  turnCompleted,
  turnCreated,
  turnPassed,
  turnScored,
} from "./actions";

const initialState = {
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
      isAnyOf(isSuccess(guessTrackReleaseYear), releaseYearGuessCreated),
      (state, { payload: { guess } }) => {
        const guesses = state.game.turns.at(-1).guesses;
        guesses.releaseYear = [
          ...guesses.releaseYear.filter(
            ({ userId }) => userId !== guess.userId,
          ),
          guess,
        ];

        const player = state.game.players.find(
          (p) => p.userId === guess.userId,
        );
        player.tokens -= guess.tokenCost;
      },
    )

    .addMatcher(
      isAnyOf(isSuccess(guessTrackCredits), creditsGuessCreated),
      (state, { payload: { guess } }) => {
        const guesses = state.game.turns.at(-1).guesses;
        guesses.credits = [
          ...guesses.credits.filter(({ userId }) => userId !== guess.userId),
          guess,
        ];

        const player = state.game.players.find(
          (p) => p.userId === guess.userId,
        );
        player.tokens -= guess.tokenCost;
      },
    )

    .addMatcher(
      isAnyOf(isSuccess(passTurn), turnPassed),
      (state, { payload: { turnPass } }) => {
        const turn = state.game.turns.at(-1);
        turn.passes = [
          ...turn.passes.filter(({ userId }) => userId !== turn.userId),
          turnPass,
        ];
      },
    )

    .addMatcher(
      isAnyOf(isSuccess(scoreTurn), turnScored),
      (state, { payload: { scoring } }) => {
        state.game.state = GAME_STATES.SCORING;

        const turn = state.game.turns.at(-1);
        turn.scoring = scoring;

        for (const player of state.game.players) {
          const { userId } = player;
          player.tokens += getTotalTokenGain(userId, scoring);

          if (userId === scoring.releaseYear.position.winner) {
            const guess = turn.guesses.releaseYear.find(
              (g) => g.userId === userId,
            );
            const position =
              userId === turn.activeUserId
                ? guess?.position
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
      (state, { payload: { track, tokenDelta } }) => {
        const turn = state.game.turns.at(-1);
        turn.track = track;
        turn.passes = [];
        for (const key of Object.keys(turn.guesses)) {
          turn.guesses[key] = [];
        }

        for (const player of state.game.players) {
          player.tokens += tokenDelta[player.userId] || 0;
        }
      },
    );
});

export default reducer;
