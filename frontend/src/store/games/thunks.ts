import tracklineApi from "@/api/trackline";
import { TracklineApiError } from "@/api/trackline/errors";
import { ACTIVE_GAME_STATES } from "@/constants";
import { createSafeAsyncThunk } from "@/store/utils/thunks";
import { ArtistMatchMode, TitleMatchMode } from "@/types/games";
import invariant from "@/utils/invariant";

import { PREFIX } from "./constants";

interface FetchGamePayload {
  gameId: string;
}
export const fetchGame = createSafeAsyncThunk(
  PREFIX,
  "fetchGame",
  async ({ gameId }: FetchGamePayload) => {
    const game = await tracklineApi.games.get({ gameId });
    return { game };
  },
);

export const fetchActiveGames = createSafeAsyncThunk(
  PREFIX,
  "fetchActiveGames",
  async () => {
    const games = await tracklineApi.games.getAll({
      state: ACTIVE_GAME_STATES,
    });
    return { games };
  },
);

interface FetchGameUsersPayload {
  gameId: string;
}
export const fetchGameUsers = createSafeAsyncThunk(
  PREFIX,
  "fetchGameUsers",
  async ({ gameId }: FetchGameUsersPayload) => {
    const users = await tracklineApi.games.getUsers({ gameId });
    return { users };
  },
);

interface CreateGamePayload {
  playlistIds: string[];
  spotifyMarket: string;
  initialTokens: number;
  maxTokens: number;
  timelineLength: number;
  artistsMatchMode: ArtistMatchMode;
  titleMatchMode: TitleMatchMode;
  creditsSimilarityThreshold: number;
  creditsFilterStopWords: boolean;
  enableCatchUp: boolean;
}
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
    creditsFilterStopWords,
    enableCatchUp,
  }: CreateGamePayload) => {
    const game = await tracklineApi.games.create({
      playlistIds,
      spotifyMarket,
      initialTokens,
      maxTokens,
      timelineLength,
      artistsMatchMode,
      titleMatchMode,
      creditsSimilarityThreshold,
      creditsFilterStopWords,
      enableCatchUp,
    });
    return { game };
  },
);

interface StartGamePayload {
  gameId: string;
}
export const startGame = createSafeAsyncThunk(
  PREFIX,
  "startGame",
  async ({ gameId }: StartGamePayload) => {
    const game = await tracklineApi.games.start({ gameId });
    const turn = await tracklineApi.games.createTurn({ gameId });
    return { game, turn };
  },
);

interface AbortGamePayload {
  gameId: string;
}
export const abortGame = createSafeAsyncThunk(
  PREFIX,
  "abortGame",
  async ({ gameId }: AbortGamePayload) => {
    await tracklineApi.games.abort({ gameId });
  },
);

interface JoinGamePayload {
  gameId: string;
}
export const joinGame = createSafeAsyncThunk(
  PREFIX,
  "joinGame",
  async ({ gameId }: JoinGamePayload) => {
    try {
      await tracklineApi.games.join({ gameId });
    } catch (e) {
      const hasJoinedAlready =
        e instanceof TracklineApiError &&
        e.errorObject?.code === "ALREADY_JOINED";

      if (!hasJoinedAlready) {
        throw e;
      }
    }

    const game = await tracklineApi.games.get({ gameId });
    return { game };
  },
);

interface LeaveGamePayload {
  gameId: string;
  userId: string;
}
export const leaveGame = createSafeAsyncThunk(
  PREFIX,
  "leaveGame",
  async ({ gameId, userId }: LeaveGamePayload) => {
    await tracklineApi.games.leave({ gameId, userId });
  },
);

interface CreateTurnPayload {
  gameId: string;
}
export const createTurn = createSafeAsyncThunk(
  PREFIX,
  "createTurn",
  async ({ gameId }: CreateTurnPayload) => {
    const turn = await tracklineApi.games.createTurn({ gameId });
    return { turn };
  },
);

interface GuessTrackReleaseYearPayload {
  gameId: string;
  turnId: number;
  turnRevisionId: string;
  position: number;
  year: number;
}
export const guessTrackReleaseYear = createSafeAsyncThunk(
  PREFIX,
  "guessTrackReleaseYear",
  async ({
    gameId,
    turnId,
    turnRevisionId,
    position,
    year,
  }: GuessTrackReleaseYearPayload) => {
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

interface GuessTrackCreditsPayload {
  gameId: string;
  turnId: number;
  turnRevisionId: string;
  artists: string[];
  title: string;
}
export const guessTrackCredits = createSafeAsyncThunk(
  PREFIX,
  "guessTrackCredits",
  async ({
    gameId,
    turnId,
    turnRevisionId,
    artists,
    title,
  }: GuessTrackCreditsPayload) => {
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

interface PassTurnPayload {
  gameId: string;
  turnId: number;
}
export const passTurn = createSafeAsyncThunk(
  PREFIX,
  "passTurn",
  async ({ gameId, turnId }: PassTurnPayload) => {
    const turnPass = await tracklineApi.games.passTurn({ gameId, turnId });

    return { turnPass };
  },
);

interface ScoreTurnPayload {
  gameId: string;
  turnId: number;
}
export const scoreTurn = createSafeAsyncThunk(
  PREFIX,
  "scoreTurn",
  async ({ gameId, turnId }: ScoreTurnPayload) => {
    const scoring = await tracklineApi.games.scoreTurn({ gameId, turnId });
    return { scoring };
  },
);

interface ProposeCorrectionPayload {
  gameId: string;
  turnId: number;
  releaseYear: number;
}
export const proposeCorrection = createSafeAsyncThunk(
  PREFIX,
  "proposeCorrection",
  async ({ gameId, turnId, releaseYear }: ProposeCorrectionPayload) => {
    const proposal = await tracklineApi.games.proposeCorrection({
      gameId,
      turnId,
      releaseYear,
    });
    return { proposal };
  },
);

interface VoteCorrectionPayload {
  gameId: string;
  turnId: number;
  agree: boolean;
}
export const voteCorrection = createSafeAsyncThunk(
  PREFIX,
  "voteCorrection",
  async ({ gameId, turnId, agree }: VoteCorrectionPayload) => {
    return await tracklineApi.games.voteCorrection({
      gameId,
      turnId,
      agree,
    });
  },
);

interface CompleteTurnPayload {
  gameId: string;
  turnId: number;
}
export const completeTurn = createSafeAsyncThunk(
  PREFIX,
  "completeTurn",
  async ({ gameId, turnId }: CompleteTurnPayload, { getState, dispatch }) => {
    const userId = getState().auth.user?.id;
    invariant(userId);

    const completion = await tracklineApi.games.completeTurn({
      gameId,
      turnId,
    });

    if (completion.turnCompleted) {
      dispatch(createTurn({ gameId }));
    }

    return { userId, completion };
  },
);

interface BuyTrackPayload {
  gameId: string;
  userId: string;
}
export const buyTrack = createSafeAsyncThunk(
  PREFIX,
  "buyTrack",
  async ({ gameId, userId }: BuyTrackPayload) => {
    const receipt = await tracklineApi.games.buyTrack({ gameId, userId });
    return { receipt };
  },
);

interface ExchangeTrackPayload {
  gameId: string;
  turnId: number;
}
export const exchangeTrack = createSafeAsyncThunk(
  PREFIX,
  "exchangeTrack",
  async ({ gameId, turnId }: ExchangeTrackPayload) => {
    const exchange = await tracklineApi.games.exchangeTrack({
      gameId,
      turnId,
    });
    return exchange;
  },
);
