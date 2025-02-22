import { createReducer, isAnyOf } from "@reduxjs/toolkit";
import { Draft } from "immer";

import { TOKEN_COST_BUY_TRACK } from "@/constants";
import { resetState } from "@/store/common/actions";
import { Game, GameState, Track, Turn, TurnScoring } from "@/types/games";
import { User } from "@/types/users";
import { aggregateTokenGains } from "@/utils/games";
import invariant from "@/utils/invariant";

import {
  clearGame,
  correctionProposed,
  correctionVoted,
  creditsGuessCreated,
  gameAborted,
  gameStarted,
  playerJoined,
  playerLeft,
  releaseYearGuessCreated,
  trackBought,
  trackExchanged,
  turnCompleted,
  turnCreated,
  turnPassed,
  turnScored,
} from "./actions";
import {
  abortGame,
  buyTrack,
  completeTurn,
  createGame,
  createTurn,
  exchangeTrack,
  fetchGame,
  fetchGameUsers,
  guessTrackCredits,
  guessTrackReleaseYear,
  joinGame,
  leaveGame,
  passTurn,
  proposeCorrection,
  scoreTurn,
  startGame,
  voteCorrection,
} from "./thunks";

interface GamesState {
  game: Game | null;
  users: User[];
}

const initialState: GamesState = {
  game: null,
  users: [],
};

const getCurrentTurn = (state: Draft<GamesState>): Draft<Turn> => {
  const turn = state.game?.turns?.at(-1);
  invariant(turn);
  return turn;
};

const getTrackPosition = (timeline: Track[], track: Track) => {
  const position = timeline.findIndex((t) => t.releaseYear > track.releaseYear);
  return position < 0 ? timeline.length : position;
};

const applyScoring = (game: Game, scoring: TurnScoring) => {
  const turn = game.turns.at(-1);
  invariant(turn);

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

const revertScoring = (game: Game) => {
  const turn = game.turns.at(-1);
  invariant(turn);

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
      invariant(state.game);

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
      invariant(state.game);

      state.game.players = state.game.players.filter(
        (p) => p.userId !== userId,
      );
      state.users = state.users.filter((u) => u.id !== userId);

      if (newTurn) {
        state.game.turns.splice(-1, 1, newTurn);
      }
    })

    .addCase(gameStarted, (state, { payload: { initialTracks } }) => {
      invariant(state.game);

      state.game.state = GameState.Started;
      state.game.players = state.game.players.map((player) => ({
        ...player,
        timeline: [initialTracks[player.userId]],
      }));
    })

    .addCase(gameAborted, (state) => {
      invariant(state.game);

      state.game.state = GameState.Aborted;
    })

    .addCase(fetchGameUsers.fulfilled, (state, { payload: { users } }) => {
      state.users = users;
    })

    .addCase(startGame.fulfilled, (state, { payload: { game, turn } }) => {
      state.game = {
        ...game,
        state: GameState.Guessing,
        turns: [turn],
      };
    })

    .addMatcher(
      isAnyOf(fetchGame.fulfilled, createGame.fulfilled, joinGame.fulfilled),
      (state, { payload: { game } }) => {
        state.game = game;
      },
    )

    .addMatcher(isAnyOf(abortGame.fulfilled, leaveGame.fulfilled), (state) => {
      state.game = null;
      state.users = [];
    })

    .addMatcher(
      isAnyOf(createTurn.fulfilled, turnCreated),
      (state, { payload: { turn } }) => {
        invariant(state.game);

        state.game.state = GameState.Guessing;
        state.game.turns.push(turn);
      },
    )

    .addMatcher(
      isAnyOf(guessTrackReleaseYear.fulfilled, releaseYearGuessCreated),
      (state, { payload: { guess } }) => {
        invariant(state.game);
        const turn = getCurrentTurn(state);

        const guesses = turn.guesses;
        guesses.releaseYear = [
          ...guesses.releaseYear.filter(
            ({ userId }) => userId !== guess.userId,
          ),
          guess,
        ];

        const player = state.game.players.find(
          (p) => p.userId === guess.userId,
        );
        if (player) {
          player.tokens -= guess.tokenCost;
        }
      },
    )

    .addMatcher(
      isAnyOf(guessTrackCredits.fulfilled, creditsGuessCreated),
      (state, { payload: { guess } }) => {
        const turn = getCurrentTurn(state);
        invariant(state.game);

        const guesses = turn.guesses;
        guesses.credits = [
          ...guesses.credits.filter(({ userId }) => userId !== guess.userId),
          guess,
        ];

        const player = state.game.players.find(
          (p) => p.userId === guess.userId,
        );
        if (player) {
          player.tokens -= guess.tokenCost;
        }
      },
    )

    .addMatcher(
      isAnyOf(passTurn.fulfilled, turnPassed),
      (state, { payload: { turnPass } }) => {
        const turn = getCurrentTurn(state);

        turn.passes = [
          ...turn.passes.filter(({ userId }) => userId !== turnPass.userId),
          turnPass,
        ];
      },
    )

    .addMatcher(
      isAnyOf(scoreTurn.fulfilled, turnScored),
      (state, { payload: { scoring } }) => {
        invariant(state.game);

        state.game.state = GameState.Scoring;
        applyScoring(state.game, scoring);
      },
    )

    .addMatcher(
      isAnyOf(completeTurn.fulfilled, turnCompleted),
      (state, { payload: { userId, completion } }) => {
        const turn = getCurrentTurn(state);
        invariant(state.game);

        if (!turn.completedBy.includes(userId)) {
          turn.completedBy.push(userId);
        }

        if (completion.gameCompleted) {
          state.game.state = GameState.Completed;
        }
      },
    )

    .addMatcher(
      isAnyOf(proposeCorrection.fulfilled, correctionProposed),
      (state, { payload: { proposal } }) => {
        const turn = getCurrentTurn(state);
        invariant(state.game);

        turn.correctionProposal = proposal;
        turn.passes = [];
      },
    )

    .addMatcher(
      isAnyOf(voteCorrection.fulfilled, correctionVoted),
      (state, { payload: { vote, proposalState, scoring } }) => {
        const turn = getCurrentTurn(state);
        invariant(state.game);

        const game = state.game;

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
      isAnyOf(buyTrack.fulfilled, trackBought),
      (state, { payload }) => {
        invariant(state.game);

        const { userId, track } =
          "receipt" in payload ? payload.receipt : payload;

        const player = state.game.players.find((p) => p.userId === userId);
        if (player) {
          const position = getTrackPosition(player.timeline, track);
          player.timeline.splice(position, 0, track);

          player.tokens -= TOKEN_COST_BUY_TRACK;
        }
      },
    )

    .addMatcher(
      isAnyOf(exchangeTrack.fulfilled, trackExchanged),
      (state, { payload: { turnRevisionId, track, tokenDelta } }) => {
        const turn = getCurrentTurn(state);
        invariant(state.game);

        turn.revisionId = turnRevisionId;
        turn.track = track;
        turn.passes = [];
        turn.guesses.credits = [];
        turn.guesses.releaseYear = [];

        for (const player of state.game.players) {
          player.tokens += tokenDelta[player.userId] || 0;
        }
      },
    );
});

export default reducer;
