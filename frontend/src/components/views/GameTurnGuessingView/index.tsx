import { useEffect, useMemo, useState } from "react";

import { Box } from "@mui/joy";

import View from "@/components/views/View";
import {
  TOKEN_COST_CREDITS_GUESS,
  TOKEN_COST_EXCHANGE_TRACK,
  TOKEN_COST_RELEASE_YEAR_GUESS,
} from "@/constants";
import {
  exchangeTrack,
  guessTrackCredits,
  guessTrackReleaseYear,
  passTurn,
  scoreTurn,
} from "@/store/games";
import { Game, Turn } from "@/types/games.ts";
import {
  useAppDispatch,
  useAppSelector,
  useBreakpoint,
  useErrorToast,
  useInterval,
  useLoadingSelector,
  useSpotifyPlayback,
} from "@/utils/hooks";

import BottomMenu from "./components/BottomMenu.tsx";
import CountdownSnackbar from "./components/CountdownSnackbar.tsx";
import ExchangeTrackModal from "./components/ExchangeTrackModal.tsx";
import FinalPhaseAlert from "./components/FInalPhaseAlert.tsx";
import GuessCreditsModal from "./components/GuessCreditsModal.tsx";
import GuessReleaseYearModal from "./components/GuessReleaseYearModal.tsx";
import PassTurnModal from "./components/PassTurnModal.tsx";
import SideMenu from "./components/SideMenu.tsx";
import StatusBar from "./components/StatusBar.tsx";
import Timeline from "./components/Timeline.tsx";
import TimelineContainer from "./components/TimelineContainer.tsx";
import TrackExchangePopup from "./components/TrackExchangePopup.tsx";
import TurnInfoPopup from "./components/TurnInfoPopup.tsx";

const getTimeout = (
  game: Game,
  turn: Turn,
  timeDeviation: number,
): { timeoutStart?: number; timeoutEnd?: number } => {
  const activeUserPass = turn.passes.find(
    (p) => p.userId === turn.activeUserId,
  );

  if (!activeUserPass) {
    return {};
  }

  const timeoutStart = Date.parse(activeUserPass.creationTime) + timeDeviation;
  const timeoutEnd = timeoutStart + game.settings.guessTimeout;

  return { timeoutStart, timeoutEnd };
};

const GameTurnGuessingView = () => {
  const isScreenXs = useBreakpoint((breakpoints) => breakpoints.only("xs"));

  const [activeTrackPosition, setActiveTrackPosition] = useState<number>(0);
  const [releaseYearModalOpen, setReleaseYearModalOpen] = useState(false);
  const [creditsModalOpen, setCreditsModalOpen] = useState(false);
  const [passTurnModalOpen, setPassTurnModalOpen] = useState(false);
  const [exchangeTrackModalOpen, setExchangeTrackModalOpen] = useState(false);
  const [wasCountdownToastDismissed, setWasCountdownToastDismissed] =
    useState(false);
  const [scoringTriggered, setScoringTriggered] = useState(false);

  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const game = useAppSelector((state) => state.games.game)!;
  const users = useAppSelector((state) => state.games.users);
  const timeDeviation = useAppSelector(
    (state) => state.timing.timeDeviation.trackline,
  );

  const loadingReleaseYearGuess = useLoadingSelector(guessTrackReleaseYear);
  const loadingCreditsGuess = useLoadingSelector(guessTrackCredits);
  const loadingPassTurn = useLoadingSelector(passTurn);
  const loadingExchangeTrack = useLoadingSelector(exchangeTrack);
  const loading =
    loadingReleaseYearGuess ||
    loadingCreditsGuess ||
    loadingPassTurn ||
    loadingExchangeTrack;

  useErrorToast(
    exchangeTrack,
    guessTrackReleaseYear,
    guessTrackCredits,
    passTurn,
    scoreTurn,
  );

  const gameId = game?.id;
  const turnId = game.turns.length - 1;
  const turn = game.turns[turnId];
  const {
    revisionId: turnRevisionId,
    activeUserId,
    track: activeTrack,
    guesses,
    passes,
  } = turn;

  const currentPlayer = game?.players.find((p) => p.userId === user?.id);
  const { isGameMaster = false } = currentPlayer || {};
  const activePlayer = game?.players.find((p) => p.userId === activeUserId);
  const isActivePlayer = user?.id === activeUserId;
  const hasPassed = passes?.some((p) => p.userId === user?.id);

  const releaseYearGuess = guesses.releaseYear.find(
    (g) => g.userId === user?.id,
  );
  const creditsGuess = guesses.credits.find((g) => g.userId === user?.id);

  const [tokenCostGuessReleaseYear, tokenCostGuessCredits] = isActivePlayer
    ? [0, 0]
    : [TOKEN_COST_RELEASE_YEAR_GUESS, TOKEN_COST_CREDITS_GUESS];

  const canGuessReleaseYear =
    !hasPassed &&
    releaseYearGuess == null &&
    currentPlayer &&
    currentPlayer?.tokens >= tokenCostGuessReleaseYear;
  const canGuessCredits =
    !hasPassed &&
    creditsGuess == null &&
    currentPlayer &&
    currentPlayer?.tokens >= tokenCostGuessCredits;
  const canExchangeTrack =
    !hasPassed &&
    currentPlayer &&
    currentPlayer?.tokens >= TOKEN_COST_EXCHANGE_TRACK;

  const { timeoutStart, timeoutEnd } = getTimeout(game, turn, timeDeviation);
  const hasTimeout = timeoutStart != null && timeoutEnd != null;

  const isAnyModalOpen =
    releaseYearModalOpen ||
    creditsModalOpen ||
    passTurnModalOpen ||
    exchangeTrackModalOpen;
  const showCountdownToast =
    isAnyModalOpen && hasTimeout && !wasCountdownToastDismissed;

  useEffect(() => {
    if (hasTimeout && !isActivePlayer && !hasPassed) {
      window.navigator.vibrate?.([100, 100]);
    }
  }, [hasTimeout, isActivePlayer]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (releaseYearGuess) {
      setActiveTrackPosition(releaseYearGuess.position);
    }
  }, [releaseYearGuess]);

  const tracks = useMemo(() => {
    if (!activePlayer) return [];

    return [
      ...activePlayer.timeline.slice(0, activeTrackPosition),
      activeTrack,
      ...activePlayer.timeline.slice(activeTrackPosition),
    ];
  }, [activeTrackPosition, activePlayer, activeTrack]);

  useEffect(() => {
    if (!hasPassed && !canGuessReleaseYear && !canGuessCredits) {
      dispatch(passTurn({ gameId, turnId }));
    }
  }, [
    dispatch,
    hasPassed,
    canGuessReleaseYear,
    canGuessCredits,
    gameId,
    turnId,
  ]);

  useEffect(() => {
    // Abort any attempts to guess or pass when a track has been exchanged
    setReleaseYearModalOpen(false);
    setCreditsModalOpen(false);
    setPassTurnModalOpen(false);
  }, [turnRevisionId]);

  useInterval(() => {
    if (
      !scoringTriggered &&
      isActivePlayer &&
      timeoutEnd != null &&
      timeoutEnd < Date.now()
    ) {
      setScoringTriggered(true);
      dispatch(scoreTurn({ gameId, turnId }));
    }
  }, 1000);

  useEffect(() => {
    if (!isActivePlayer || scoringTriggered) return;

    const haveAllPlayersPassed = game.players.every(({ userId }) =>
      passes.some((p) => p.userId === userId),
    );
    if (haveAllPlayersPassed) {
      setScoringTriggered(true);
      dispatch(scoreTurn({ gameId, turnId }));
    }
  }, [
    dispatch,
    isActivePlayer,
    scoringTriggered,
    game,
    passes,
    gameId,
    turnId,
  ]);

  useSpotifyPlayback({
    isEnabled: isGameMaster,
    trackId: activeTrack.spotifyId,
    pauseOnUnmount: false,
  });

  const handleGuessReleaseYear = ({
    position,
    year,
  }: {
    position: number;
    year: number;
  }) => {
    dispatch(
      guessTrackReleaseYear({
        gameId,
        turnId,
        turnRevisionId,
        position,
        year,
      }),
    );
  };

  const handleGuessCredits = ({
    artists,
    title,
  }: {
    artists: string[];
    title: string;
  }) => {
    dispatch(
      guessTrackCredits({
        gameId,
        turnId,
        turnRevisionId,
        artists,
        title,
      }),
    );
  };

  const handlePassTurn = () => {
    dispatch(passTurn({ gameId, turnId }));
  };

  const handleExchangeTrack = () => {
    dispatch(exchangeTrack({ gameId, turnId }));
  };

  return (
    <View
      appBar={{
        showPlayerInfo: true,
        showPlaybackControls: isGameMaster,
        showExitGame: true,
      }}
      disablePadding
      disableScrolling
    >
      <TurnInfoPopup game={game} users={users} currentUserId={user?.id} />
      <TrackExchangePopup game={game} users={users} currentUserId={user?.id} />

      <GuessReleaseYearModal
        open={releaseYearModalOpen}
        tracks={tracks}
        activeTrackId={turn?.track?.spotifyId}
        tokenCost={tokenCostGuessReleaseYear}
        playerTokens={currentPlayer?.tokens}
        onConfirm={handleGuessReleaseYear}
        onClose={() => setReleaseYearModalOpen(false)}
      />
      <GuessCreditsModal
        open={creditsModalOpen}
        tokenCost={tokenCostGuessCredits}
        playerTokens={currentPlayer?.tokens}
        onConfirm={handleGuessCredits}
        onClose={() => setCreditsModalOpen(false)}
      />
      <ExchangeTrackModal
        open={exchangeTrackModalOpen}
        onConfirm={handleExchangeTrack}
        onClose={() => setExchangeTrackModalOpen(false)}
      />
      <PassTurnModal
        open={passTurnModalOpen}
        canGuessReleaseYear={canGuessReleaseYear}
        canGuessCredits={canGuessCredits}
        onConfirm={handlePassTurn}
        onClose={() => setPassTurnModalOpen(false)}
      />

      <CountdownSnackbar
        open={showCountdownToast}
        timeoutStart={timeoutStart}
        timeoutEnd={timeoutEnd}
        onClose={() => setWasCountdownToastDismissed(true)}
      />

      <FinalPhaseAlert game={game} />

      <Box
        sx={{
          display: "flex",
          flex: "1 1 0",
          overflow: "hidden",
        }}
      >
        {!isScreenXs && (
          <SideMenu
            showExchangeTrack={isActivePlayer}
            canExchangeTrack={canExchangeTrack && !loading}
            canPassTurn={!hasPassed && !loading}
            loadingPassTurn={loadingPassTurn}
            loadingExchangeTrack={loadingExchangeTrack}
            onExchangeTrack={() => setExchangeTrackModalOpen(true)}
            onPassTurn={() => setPassTurnModalOpen(true)}
          />
        )}
        <TimelineContainer
          sx={(theme) => ({
            ml: { sm: `calc(-5px - ${theme.spacing(1)})` },
            pl: { sm: "5px" },
          })}
        >
          <Timeline
            tracks={tracks}
            activeTrackId={activeTrack.spotifyId}
            releaseYearGuess={releaseYearGuess}
            creditsGuess={creditsGuess}
            canGuessReleaseYear={canGuessReleaseYear}
            canGuessCredits={canGuessCredits}
            tokenCostGuessReleaseYear={tokenCostGuessReleaseYear}
            tokenCostGuessCredits={tokenCostGuessCredits}
            loadingReleaseYearGuess={loadingReleaseYearGuess}
            loadingCreditsGuess={loadingCreditsGuess}
            timeoutStart={timeoutStart}
            timeoutEnd={timeoutEnd}
            onActiveTrackPositionChange={setActiveTrackPosition}
            onGuessReleaseYear={() => setReleaseYearModalOpen(true)}
            onGuessCredits={() => setCreditsModalOpen(true)}
          />
        </TimelineContainer>
      </Box>

      <Box sx={{ flexGrow: 0 }}>
        {isScreenXs ? (
          <BottomMenu
            game={game}
            users={users}
            currentUserId={user?.id}
            showExchangeTrack={isActivePlayer}
            canExchangeTrack={canExchangeTrack && !loading}
            canPassTurn={!hasPassed && !loading}
            loadingPassTurn={loadingPassTurn}
            loadingExchangeTrack={loadingExchangeTrack}
            onExchangeTrack={() => setExchangeTrackModalOpen(true)}
            onPassTurn={() => setPassTurnModalOpen(true)}
          />
        ) : (
          <Box sx={{ px: 2, pb: 1 }}>
            <StatusBar game={game} users={users} currentUserId={user?.id} />
          </Box>
        )}
      </Box>
    </View>
  );
};

export default GameTurnGuessingView;
