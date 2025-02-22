import { createReducer, isAnyOf } from "@reduxjs/toolkit";

import { GAME_STATES, TOKEN_COST_BUY_TRACK } from "@/constants";
import { resetState } from "@/store/common/actions";
import { isSuccess } from "@/store/utils/matchers";
import { aggregateTokenGains } from "@/utils/games";

import {
  abortGame,
  buyTrack,
  clearGame,
  completeTurn,
  correctionProposed,
  correctionVoted,
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
  proposeCorrection,
  releaseYearGuessCreated,
  scoreTurn,
  startGame,
  trackBought,
  trackExchanged,
  turnCompleted,
  turnCreated,
  turnPassed,
  turnScored,
  voteCorrection,
} from "./actions";

const initialState = {
  game: null,
  users: [],
};

const getTrackPosition = (timeline, track) => {
  let position = timeline.findIndex((t) => t.releaseYear > track.releaseYear);
  return position < 0 ? timeline.length : position;
};

const applyScoring = (game, scoring) => {
  const turn = game.turns.at(-1);
  turn.scoring = scoring;

  for (const player of game.players) {
    const { userId } = player;

    const { refund, rewardEffective } = aggregateTokenGains(userId, scoring);
    player.tokens += refund + rewardEffective;

    if (userId === scoring.releaseYear.position.winner) {
      const guess = turn.guesses.releaseYear.find((g) => g.userId === userId);
      const position =
        userId === turn.activeUserId
          ? guess?.position
          : getTrackPosition(player.timeline, turn.track);

      if (position != null) {
        player.timeline.splice(position, 0, turn.track);
      }
    }
  }
};

const revertScoring = (game) => {
  const turn = game.turns.at(-1);

  for (const player of game.players) {
    const { userId } = player;

    player.timeline = player.timeline.filter(
      (t) => t.spotifyId !== turn.track.spotifyId,
    );

    const tokenGain = aggregateTokenGains(userId, turn.scoring);
    player.tokens -= tokenGain.refund + tokenGain.rewardEffective;
  }
};

const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(resetState, () => initialState)

    .addCase(clearGame, (state) => {
      state.game = null;
      state.users = [];
    })

    .addCase(playerJoined, (state, { payload: { user, player, position } }) => {
      const players = state.game.players.filter(
        (p) => p.userId !== player.userId,
      );
      state.game.players = [
        ...players.slice(0, position),
        player,
        ...players.slice(position),
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
        applyScoring(state.game, scoring);
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
      isAnyOf(isSuccess(proposeCorrection), correctionProposed),
      (state, { payload: { proposal } }) => {
        const turn = state.game.turns.at(-1);
        turn.correctionProposal = proposal;
        turn.passes = [];
      },
    )

    .addMatcher(
      isAnyOf(isSuccess(voteCorrection), correctionVoted),
      (state, { payload: { vote, proposalState, scoring } }) => {
        const game = state.game;
        const turn = game.turns.at(-1);

        const proposal = turn.correctionProposal;
        proposal.state = proposalState;
        proposal.votes = [
          ...proposal.votes.filter(({ userId }) => userId !== vote.userId),
          vote,
        ];

        if (scoring) {
          turn.track.releaseYear = proposal.releaseYear;

          revertScoring(game);
          applyScoring(game, scoring);
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
      (state, { payload: { turnRevisionId, track, tokenDelta } }) => {
        const turn = state.game.turns.at(-1);
        turn.revisionId = turnRevisionId;
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
