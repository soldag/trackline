import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Box } from "@mui/joy";

import StatusBar from "~/components/views/GameTurnGuessingView/components/StatusBar";
import View from "~/components/views/View";
import {
  TOKEN_COST_EXCHANGE_TRACK,
  TOKEN_COST_POSITION_GUESS,
  TOKEN_COST_YEAR_GUESS,
} from "~/constants";
import {
  exchangeTrack,
  guessTrack,
  rejectGuess,
  scoreTurn,
} from "~/store/games/actions";
import { play } from "~/store/spotify/actions";
import { isValidGuess } from "~/utils/games";
import { useErrorToast, useInterval, useLoadingSelector } from "~/utils/hooks";

import Timeline from "./components/Timeline";

// You can only guess the exact year when guessing the position, too
const TOKEN_COST_YEAR_GUESS_TOTAL =
  TOKEN_COST_POSITION_GUESS + TOKEN_COST_YEAR_GUESS;

const canGuess = (turn, player, cost) =>
  turn?.activeUserId === player?.userId || player?.tokens >= cost;

const getTimeout = (game, turn, timeDeviation) => {
  const activePlayerGuess = turn.guesses.find(
    (g) => g.userId === turn.activeUserId,
  );
  if (!activePlayerGuess) {
    return { timeoutStart: null, timeoutEnd: null };
  }

  const { creationTime } = activePlayerGuess;
  const timeoutStart = Date.parse(creationTime) + timeDeviation;
  const timeoutEnd = timeoutStart + game.settings.guessTimeout;

  return { timeoutStart, timeoutEnd };
};

const GameTurnGuessingView = () => {
  const [tracks, setTracks] = useState([]);
  const [scoringTriggered, setScoringTriggered] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const game = useSelector((state) => state.games.game);
  const users = useSelector((state) => state.games.users);
  const timeDeviation = useSelector(
    (state) => state.timing.timeDeviation.trackline,
  );

  const loadingExchangeTrack = useLoadingSelector(exchangeTrack);
  const loadingGuessTrack = useLoadingSelector(guessTrack);
  const loadingRejectGuess = useLoadingSelector(rejectGuess);
  useErrorToast(exchangeTrack, guessTrack, rejectGuess, scoreTurn);

  const gameId = game?.id;
  const turnId = game.turns.length - 1;
  const turn = game.turns[turnId];
  const guess = turn?.guesses.find((g) => g.userId === user?.id);
  const currentPlayer = game?.players.find((p) => p.userId === user?.id);
  const { isGameMaster = false } = currentPlayer || {};
  const activePlayer = game?.players.find(
    (p) => p.userId === turn.activeUserId,
  );
  const isActivePlayer = user?.id === turn?.activeUserId;

  const canGuessPosition =
    guess == null && canGuess(turn, currentPlayer, TOKEN_COST_POSITION_GUESS);
  const canGuessYear =
    guess == null && canGuess(turn, currentPlayer, TOKEN_COST_YEAR_GUESS_TOTAL);
  const canExchangeTrack =
    guess == null && activePlayer?.tokens >= TOKEN_COST_EXCHANGE_TRACK;

  const { timeoutStart, timeoutEnd } = getTimeout(game, turn, timeDeviation);

  useEffect(() => {
    if (guess == null) {
      setTracks([turn.track, ...activePlayer.timeline]);
    } else if (guess.position != null) {
      setTracks([
        ...activePlayer.timeline.slice(0, guess.position),
        turn.track,
        ...activePlayer.timeline.slice(guess.position),
      ]);
    }
  }, [guess, turn.track, activePlayer.timeline]);

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

    const hasOutstandingGuesses = game.players.some(
      (p) =>
        !turn.guesses.some((g) => g.userId == p.userId) &&
        (p.userId === turn.activeUserId ||
          p.tokens >= TOKEN_COST_POSITION_GUESS),
    );
    if (!hasOutstandingGuesses) {
      setScoringTriggered(true);
      dispatch(scoreTurn({ gameId, turnId }));
    }
  }, [dispatch, isActivePlayer, scoringTriggered, game, turn, gameId, turnId]);

  useEffect(() => {
    if (isGameMaster) {
      dispatch(play({ trackId: turn.track.spotifyId }));
    }
  }, [dispatch, turn.track.spotifyId, isGameMaster]);

  const handleGuess = ({ year }) => {
    const index = tracks.findIndex((t) => t.spotifyId === turn.track.spotifyId);
    dispatch(
      guessTrack({
        gameId,
        turnId,
        position: index >= 0 ? index : null,
        releaseYear: year,
      }),
    );
  };

  const handleReject = () => {
    dispatch(rejectGuess({ gameId, turnId }));
  };

  const handleExchange = () => {
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
      <Box
        sx={{
          "display": "flex",
          "px": 2,
          "py": 1,
          "overflowX": "auto",
          "WebkitOverflowScrolling": "touch",
          "msOverflowStyle": "none",
          "scrollbarWidth": "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <Timeline
          tracks={tracks}
          activeTrackId={turn.track.spotifyId}
          showRange={isValidGuess(guess)}
          canGuessPosition={canGuessPosition}
          canGuessYear={canGuessYear}
          showExchange={isActivePlayer}
          canExchange={canExchangeTrack}
          showReject={!isActivePlayer}
          canReject={canGuessPosition || canGuessYear}
          timeoutStart={timeoutStart}
          timeoutEnd={timeoutEnd}
          loadingGuess={loadingGuessTrack}
          loadingReject={loadingRejectGuess}
          loadingExchange={loadingExchangeTrack}
          onTracksChange={setTracks}
          onGuess={handleGuess}
          onReject={handleReject}
          onExchange={handleExchange}
        />
      </Box>

      <Box
        sx={{
          flexGrow: 0,
          px: 2,
          pb: 1,
        }}
      >
        <StatusBar game={game} users={users} currentUserId={user?.id} />
      </Box>
    </View>
  );
};

export default GameTurnGuessingView;
