import tracklineApi from "@/api/trackline";
import { createSafeAsyncThunk } from "@/store/utils/thunks";

import { PREFIX } from "./constants";

export const fetchGame = createSafeAsyncThunk(
  PREFIX,
  "fetchGame",
  async ({ gameId }) => {
    const game = await tracklineApi.games.get({ gameId });
    return { game };
  },
);

export const fetchGameUsers = createSafeAsyncThunk(
  PREFIX,
  "fetchGameUsers",
  async ({ gameId }) => {
    const users = await tracklineApi.games.getUsers({ gameId });
    return { users };
  },
);

export const createGame = createSafeAsyncThunk(
  PREFIX,
  "createGame",
  async ({
    playlistIds,
    spotifyMarket,
    initialTokens,
    maxTokens,
    timelineLength,
    artistsMatchMode,
    titleMatchMode,
    creditsSimilarityThreshold,
  }) => {
    const game = await tracklineApi.games.create({
      playlistIds,
      spotifyMarket,
      initialTokens,
      maxTokens,
      timelineLength,
      artistsMatchMode,
      titleMatchMode,
      creditsSimilarityThreshold,
    });
    return { game };
  },
);

export const startGame = createSafeAsyncThunk(
  PREFIX,
  "startGame",
  async ({ gameId }) => {
    const game = await tracklineApi.games.start({ gameId });
    const turn = await tracklineApi.games.createTurn({ gameId });
    return { game, turn };
  },
);

export const abortGame = createSafeAsyncThunk(
  PREFIX,
  "abortGame",
  async ({ gameId }) => {
    await tracklineApi.games.abort({ gameId });
  },
);

export const joinGame = createSafeAsyncThunk(
  PREFIX,
  "joinGame",
  async ({ gameId }) => {
    try {
      await tracklineApi.games.join({ gameId });
    } catch (e) {
      if (!e.errors?.some(({ code }) => code === "ALREADY_JOINED")) {
        throw e;
      }
    }

    const game = await tracklineApi.games.get({ gameId });
    return { game };
  },
);

export const leaveGame = createSafeAsyncThunk(
  PREFIX,
  "leaveGame",
  async ({ gameId, userId }) => {
    await tracklineApi.games.leave({ gameId, userId });
  },
);

export const createTurn = createSafeAsyncThunk(
  PREFIX,
  "createTurn",
  async ({ gameId }) => {
    const turn = await tracklineApi.games.createTurn({ gameId });
    return { turn };
  },
);

export const guessTrackReleaseYear = createSafeAsyncThunk(
  PREFIX,
  "guessTrackReleaseYear",
  async ({ gameId, turnId, turnRevisionId, position, year }) => {
    const guess = await tracklineApi.games.createReleaseYearGuess({
      gameId,
      turnId,
      turnRevisionId,
      position,
      year,
    });

    return { guess };
  },
);

export const guessTrackCredits = createSafeAsyncThunk(
  PREFIX,
  "guessTrackCredits",
  async ({ gameId, turnId, turnRevisionId, artists, title }) => {
    const guess = await tracklineApi.games.createCreditsGuess({
      gameId,
      turnId,
      turnRevisionId,
      artists,
      title,
    });

    return { guess };
  },
);

export const passTurn = createSafeAsyncThunk(
  PREFIX,
  "passTurn",
  async ({ gameId, turnId }) => {
    const turnPass = await tracklineApi.games.passTurn({ gameId, turnId });

    return { turnPass };
  },
);

export const scoreTurn = createSafeAsyncThunk(
  PREFIX,
  "scoreTurn",
  async ({ gameId, turnId }) => {
    const scoring = await tracklineApi.games.scoreTurn({ gameId, turnId });
    return { scoring };
  },
);

export const proposeCorrection = createSafeAsyncThunk(
  PREFIX,
  "proposeCorrection",
  async ({ gameId, turnId, releaseYear }) => {
    const proposal = await tracklineApi.games.proposeCorrection({
      gameId,
      turnId,
      releaseYear,
    });
    return { proposal };
  },
);

export const voteCorrection = createSafeAsyncThunk(
  PREFIX,
  "voteCorrection",
  async ({ gameId, turnId, agree }) => {
    return await tracklineApi.games.voteCorrection({
      gameId,
      turnId,
      agree,
    });
  },
);

export const completeTurn = createSafeAsyncThunk(
  PREFIX,
  "completeTurn",
  async ({ gameId, turnId }, { getState, dispatch }) => {
    const userId = getState().auth.user?.id;
    const completion = await tracklineApi.games.completeTurn({
      gameId,
      turnId,
    });

    if (completion.turnCompleted) {
      dispatch(createTurn({ gameId, turnId }));
    }

    return { userId, completion };
  },
);

export const buyTrack = createSafeAsyncThunk(
  PREFIX,
  "buyTrack",
  async ({ gameId, userId }) => {
    const receipt = await tracklineApi.games.buyTrack({ gameId, userId });
    return { receipt };
  },
);

export const exchangeTrack = createSafeAsyncThunk(
  PREFIX,
  "exchangeTrack",
  async ({ gameId, turnId }) => {
    const exchange = await tracklineApi.games.exchangeTrack({
      gameId,
      turnId,
    });
    return exchange;
  },
);
