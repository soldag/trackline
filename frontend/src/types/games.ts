export enum GameState {
  WaitingForPlayers = "waiting_for_players",
  Started = "started",
  Guessing = "guessing",
  Scoring = "scoring",
  Completed = "completed",
  Aborted = "aborted",
}

export enum ArtistMatchMode {
  All = "all",
  One = "one",
}

export enum TitleMatchMode {
  Full = "full",
  Main = "main",
}

export enum CreditsStrictness {
  Exact = "exact",
  Strict = "strict",
  Moderate = "moderate",
  Relaxed = "relaxed",
}

export enum CorrectionProposalState {
  Voting = "VOTING",
  Accepted = "ACCEPTED",
  Rejected = "REJECTED",
}

export interface Track {
  spotifyId: string;
  title: string;
  artists: string[];
  releaseYear: number;
  imageUrl: string;
}

export interface Player {
  userId: string;
  isGameMaster: boolean;
  tokens: number;
  timeline: Track[];
}

export interface Guess {
  creationTime: string;
  userId: string;
  tokenCost: number;
}

export interface ReleaseYearGuess extends Guess {
  position: number;
  year: number;
}

export interface CreditsGuess extends Guess {
  artists: string[];
  title: string;
}

export interface TurnPass {
  userId: string;
  creationTime: string;
}

export interface CorrectionProposalVote {
  userId: string;
  agree: boolean;
  creationTime: string;
}

export interface CorrectionProposal {
  createdBy: string;
  creationTime: string;
  state: CorrectionProposalState;
  releaseYear: number;
  votes: CorrectionProposalVote[];
}

export interface TokenGain {
  refund: number;
  rewardTheoretical: number;
  rewardEffective: number;
}

interface Scoring {
  winner: string;
  correctGuesses: string[];
  tokenGains: { [userId: string]: TokenGain };
}

export interface ReleaseYearScoring {
  position: Scoring;
  year: Scoring;
}

export interface CreditsScoring extends Scoring {
  similarityScores: { [userId: string]: number };
}

export interface TurnScoring {
  releaseYear: ReleaseYearScoring;
  credits: CreditsScoring;
}

export interface Turn {
  revisionId: string;
  creationTime: string;
  activeUserId: string;
  track: Track;
  catchUpTokenGain: { [userId: string]: number };
  guesses: {
    releaseYear: ReleaseYearGuess[];
    credits: CreditsGuess[];
  };
  passes: TurnPass[];
  scoring: TurnScoring;
  correctionProposal: CorrectionProposal;
  completedBy: string[];
}

export interface GameSettings {
  artistsMatchMode: ArtistMatchMode;
  creditsSimilarityThreshold: number;
  guessTimeout: number;
  initialTokens: number;
  maxTokens: number;
  playlistIds: string[];
  spotifyMarket: string;
  timelineLength: number;
  titleMatchMode: TitleMatchMode;
}

export interface Game {
  id: string;
  creationTime: string;
  settings: GameSettings;
  state: GameState;
  turns: Turn[];
  players: Player[];
}
