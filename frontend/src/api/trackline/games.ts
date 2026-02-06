import {
  ArtistMatchMode,
  CorrectionProposal,
  CorrectionProposalState,
  CorrectionProposalVote,
  CreditsGuess,
  Game,
  GameState,
  Player,
  ReleaseYearGuess,
  TitleMatchMode,
  Track,
  Turn,
  TurnPass,
  TurnScoring,
} from "@/types/games";
import { User } from "@/types/users";

import instance from "./instance";
import { EntityResponse } from "./types";

export const create = async ({
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
}: {
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
}): Promise<Game> => {
  const {
    data: { data: game },
  } = await instance.post<EntityResponse<Game>>("games", {
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

  return game;
};

export const get = async ({ gameId }: { gameId: string }): Promise<Game> => {
  const {
    data: { data: game },
  } = await instance.get<EntityResponse<Game>>(`games/${gameId}`);

  return game;
};

export const getAll = async (
  params: { state?: GameState[] } = {},
): Promise<Game[]> => {
  const {
    data: { data: games },
  } = await instance.get<EntityResponse<Game[]>>("games", {
    params,
  });

  return games;
};

export const getUsers = async ({
  gameId,
}: {
  gameId: string;
}): Promise<User[]> => {
  const {
    data: { data: users },
  } = await instance.get<EntityResponse<User[]>>(`games/${gameId}/users`);
  return users;
};

export const join = async ({ gameId }: { gameId: string }): Promise<Player> => {
  const {
    data: { data: player },
  } = await instance.put<EntityResponse<Player>>(`games/${gameId}/players`);
  return player;
};

export const leave = async ({
  userId,
  gameId,
}: {
  userId: string;
  gameId: string;
}): Promise<void> => {
  await instance.delete(`games/${gameId}/players/${userId}`);
};

export const start = async ({ gameId }: { gameId: string }): Promise<Game> => {
  const {
    data: { data: game },
  } = await instance.post<EntityResponse<Game>>(`games/${gameId}/start`);

  return game;
};

export const abort = async ({ gameId }: { gameId: string }): Promise<void> => {
  await instance.post(`games/${gameId}/abort`);
};

export const createTurn = async ({
  gameId,
}: {
  gameId: string;
}): Promise<Turn> => {
  const {
    data: { data: turn },
  } = await instance.post<EntityResponse<Turn>>(`games/${gameId}/turns`);

  return turn;
};

export const createReleaseYearGuess = async ({
  gameId,
  turnId,
  turnRevisionId,
  position,
  year,
}: {
  gameId: string;
  turnId: number;
  turnRevisionId: string;
  position: number;
  year: number;
}): Promise<ReleaseYearGuess> => {
  const {
    data: { data: guess },
  } = await instance.post<EntityResponse<ReleaseYearGuess>>(
    `games/${gameId}/turns/${turnId}/guesses/release-year`,
    {
      turnRevisionId,
      position,
      year,
    },
  );

  return guess;
};

export const createCreditsGuess = async ({
  gameId,
  turnId,
  turnRevisionId,
  artists,
  title,
}: {
  gameId: string;
  turnId: number;
  turnRevisionId: string;
  artists: string[];
  title: string;
}): Promise<CreditsGuess> => {
  const {
    data: { data: guess },
  } = await instance.post<EntityResponse<CreditsGuess>>(
    `games/${gameId}/turns/${turnId}/guesses/credits`,
    {
      turnRevisionId,
      artists,
      title,
    },
  );

  return guess;
};

export const passTurn = async ({
  gameId,
  turnId,
}: {
  gameId: string;
  turnId: number;
}): Promise<TurnPass> => {
  const {
    data: { data: turnPass },
  } = await instance.post<EntityResponse<TurnPass>>(
    `games/${gameId}/turns/${turnId}/pass`,
  );

  return turnPass;
};

export const scoreTurn = async ({
  gameId,
  turnId,
}: {
  gameId: string;
  turnId: number;
}): Promise<TurnScoring> => {
  const {
    data: { data: scoring },
  } = await instance.post<EntityResponse<TurnScoring>>(
    `games/${gameId}/turns/${turnId}/score`,
  );

  return scoring;
};

export const proposeCorrection = async ({
  gameId,
  turnId,
  releaseYear,
}: {
  gameId: string;
  turnId: number;
  releaseYear: number;
}): Promise<CorrectionProposal> => {
  const {
    data: { data: proposal },
  } = await instance.post<EntityResponse<CorrectionProposal>>(
    `games/${gameId}/turns/${turnId}/correction`,
    {
      releaseYear,
    },
  );

  return proposal;
};

interface VoteCorrectionResult {
  vote: CorrectionProposalVote;
  proposalState: CorrectionProposalState;
  scoring: TurnScoring | null;
}

export const voteCorrection = async ({
  gameId,
  turnId,
  agree,
}: {
  gameId: string;
  turnId: number;
  agree: boolean;
}): Promise<VoteCorrectionResult> => {
  const {
    data: { data: vote },
  } = await instance.post<EntityResponse<VoteCorrectionResult>>(
    `games/${gameId}/turns/${turnId}/correction/vote`,
    {
      agree,
    },
  );

  return vote;
};

interface CompleteTurnResult {
  turnCompleted: boolean;
  gameCompleted: boolean;
}

export const completeTurn = async ({
  gameId,
  turnId,
}: {
  gameId: string;
  turnId: number;
}): Promise<CompleteTurnResult> => {
  const {
    data: { data: completion },
  } = await instance.post<EntityResponse<CompleteTurnResult>>(
    `games/${gameId}/turns/${turnId}/complete`,
  );

  return completion;
};

interface BuyTrackResult {
  userId: string;
  track: Track;
}

export const buyTrack = async ({
  gameId,
  userId,
}: {
  gameId: string;
  userId: string;
}): Promise<BuyTrackResult> => {
  const {
    data: { data: receipt },
  } = await instance.post<EntityResponse<BuyTrackResult>>(
    `games/${gameId}/players/${userId}/timeline`,
  );

  return receipt;
};

interface ExchangeTrackResult {
  turnRevisionId: string;
  track: Track;
  tokenDelta: { [userId: string]: number };
}

export const exchangeTrack = async ({
  gameId,
  turnId,
}: {
  gameId: string;
  turnId: number;
}): Promise<ExchangeTrackResult> => {
  const {
    data: { data: exchange },
  } = await instance.post<EntityResponse<ExchangeTrackResult>>(
    `games/${gameId}/turns/${turnId}/track/exchange`,
  );

  return exchange;
};
