import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Box } from "@mui/joy";

import View from "~/components/views/View";
import {
  TOKEN_COST_CREDITS_GUESS,
  TOKEN_COST_EXCHANGE_TRACK,
  TOKEN_COST_RELEASE_YEAR_GUESS,
} from "~/constants";
import {
  exchangeTrack,
  guessTrackCredits,
  guessTrackReleaseYear,
  passTurn,
  scoreTurn,
  stopRoutines,
} from "~/store/games/actions";
import { play } from "~/store/spotify/actions";
import {
  useBreakpoint,
  useErrorToast,
  useInterval,
  useLoadingSelector,
} from "~/utils/hooks";

import BottomMenu from "./components/BottomMenu";
import CountdownSnackbar from "./components/CountdownSnackbar";
import ExchangeTrackModal from "./components/ExchangeTrackModal";
import GuessCreditsModal from "./components/GuessCreditsModal";
import GuessReleaseYearModal from "./components/GuessReleaseYearModal";
import PassTurnModal from "./components/PassTurnModal";
import SideMenu from "./components/SideMenu";
import StatusBar from "./components/StatusBar";
import Timeline from "./components/Timeline";
import TimelineContainer from "./components/TimelineContainer";
import TrackExchangePopup from "./components/TrackExchangePopup";
import TurnInfoPopup from "./components/TurnInfoPopup";

const hasTokensToGuess = (turn, player, cost) => {
  const isActivePlayer = turn?.activeUserId === player?.userId;
  const hasEnoughTokens = player?.tokens >= cost;

  return isActivePlayer || hasEnoughTokens;
};

const getTimeout = (game, turn, timeDeviation) => {
  const activeUserPass = turn.passes.find(
    (p) => p.userId === turn.activeUserId,
  );

  if (!activeUserPass) {
    return { timeoutStart: null, timeoutEnd: null };
  }

  const timeoutStart = Date.parse(activeUserPass.creationTime) + timeDeviation;
  const timeoutEnd = timeoutStart + game.settings.guessTimeout;

  return { timeoutStart, timeoutEnd };
};

const GameTurnGuessingView = () => {
  const isScreenXs = useBreakpoint((breakpoints) => breakpoints.only("xs"));

  const [tracks, setTracks] = useState([]);
  const [activeTrackId, setActiveTrackId] = useState();
  const [releaseYearModalOpen, setReleaseYearModalOpen] = useState(false);
  const [creditsModalOpen, setCreditsModalOpen] = useState(false);
  const [passTurnModalOpen, setPassTurnModalOpen] = useState(false);
  const [exchangeTrackModalOpen, setExchangeTrackModalOpen] = useState(false);
  const [wasCountdownToastDismissed, setWasCountdownToastDismissed] =
    useState(false);
  const [scoringTriggered, setScoringTriggered] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const game = useSelector((state) => state.games.game);
  const users = useSelector((state) => state.games.users);
  const timeDeviation = useSelector(
    (state) => state.timing.timeDeviation.trackline,
  );
  const playbackTrackId = useSelector(
    (state) => state.spotify.playback.trackId,
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
    track,
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

  const canGuessReleaseYear =
    !hasPassed &&
    releaseYearGuess == null &&
    hasTokensToGuess(turn, currentPlayer, TOKEN_COST_RELEASE_YEAR_GUESS);
  const canGuessCredits =
    !hasPassed &&
    creditsGuess == null &&
    hasTokensToGuess(turn, currentPlayer, TOKEN_COST_CREDITS_GUESS);
  const canExchangeTrack =
    !hasPassed && activePlayer?.tokens >= TOKEN_COST_EXCHANGE_TRACK;

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
    return () => dispatch(stopRoutines());
  }, [dispatch]);

  useEffect(() => {
    if (hasTimeout && !isActivePlayer && !hasPassed) {
      window.navigator.vibrate?.([100, 100]);
    }
  }, [hasTimeout, isActivePlayer]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setActiveTrackId(track.spotifyId);

    if (releaseYearGuess == null) {
      setTracks((oldTracks) => {
        const oldIndex = oldTracks.findIndex(
          (t) => t.spotifyId === track.spotifyId,
        );
        if (oldIndex === -1) {
          return [track, ...activePlayer.timeline];
        } else {
          return [
            ...activePlayer.timeline.slice(0, oldIndex),
            track,
            ...activePlayer.timeline.slice(oldIndex),
          ];
        }
      });
    } else if (releaseYearGuess.position != null) {
      setTracks([
        ...activePlayer.timeline.slice(0, releaseYearGuess.position),
        track,
        ...activePlayer.timeline.slice(releaseYearGuess.position),
      ]);
    }
  }, [releaseYearGuess, track, activePlayer.timeline]);

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

  useEffect(() => {
    if (isGameMaster && playbackTrackId !== track.spotifyId) {
      dispatch(play({ trackId: track.spotifyId }));
    }
  }, [dispatch, track.spotifyId, isGameMaster, playbackTrackId]);

  const handleGuessReleaseYear = ({ position, year }) => {
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

  const handleGuessCredits = ({ artists, title }) => {
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
        onConfirm={handleGuessReleaseYear}
        onClose={() => setReleaseYearModalOpen(false)}
      />
      <GuessCreditsModal
        open={creditsModalOpen}
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
            activeTrackId={activeTrackId}
            releaseYearGuess={releaseYearGuess}
            creditsGuess={creditsGuess}
            canGuessReleaseYear={canGuessReleaseYear}
            canGuessCredits={canGuessCredits}
            loadingReleaseYearGuess={loadingReleaseYearGuess}
            loadingCreditsGuess={loadingCreditsGuess}
            timeoutStart={timeoutStart}
            timeoutEnd={timeoutEnd}
            onTracksChange={setTracks}
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
