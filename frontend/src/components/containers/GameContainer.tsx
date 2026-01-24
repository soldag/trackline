import { useCallback, useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router";

import GameAbortView from "@/components/views/GameAbortView";
import GameCompletionView from "@/components/views/GameCompletionView";
import GameLobbyView from "@/components/views/GameLobbyView";
import GameTurnGuessingView from "@/components/views/GameTurnGuessingView";
import GameTurnScoringView from "@/components/views/GameTurnScoringView";
import LoadingView from "@/components/views/LoadingView";
import { clearGame, fetchGame, fetchGameUsers } from "@/store/games";
import { pause } from "@/store/spotify";
import { GameState } from "@/types/games";
import {
  useAppDispatch,
  useAppSelector,
  usePrevious,
  useSpotify,
  useUnmountEffect,
} from "@/utils/hooks";
import { useNotifications } from "@/utils/notifications";

const GAME_STATE_VIEWS = {
  [GameState.WaitingForPlayers]: GameLobbyView,
  [GameState.Started]: LoadingView,
  [GameState.Guessing]: GameTurnGuessingView,
  [GameState.Scoring]: GameTurnScoringView,
  [GameState.Completed]: GameCompletionView,
  [GameState.Aborted]: GameAbortView,
};

const GameContainer = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const game = useAppSelector((state) => state.games.game);

  const currentPlayer = game?.players.find((p) => p.userId === user?.id);
  const { isGameMaster = false } = currentPlayer || {};

  const refreshGame = useCallback(() => {
    if (gameId) {
      dispatch(fetchGame({ gameId }));
      dispatch(fetchGameUsers({ gameId }));
    }
  }, [gameId, dispatch]);

  useNotifications({
    gameId,
    onReconnect: refreshGame,
  });
  useSpotify({ requireAuth: isGameMaster });

  useEffect(() => {
    refreshGame();
    return () => {
      dispatch(clearGame());
    };
  }, [refreshGame, dispatch]);

  const prevGame = usePrevious(game);
  useEffect(() => {
    if (prevGame && !game) {
      navigate("/", { replace: true });
    }
  }, [prevGame, game, navigate]);

  useUnmountEffect(() => {
    if (isGameMaster) {
      dispatch(pause());
    }
  });

  if (!gameId) {
    return <Navigate replace to="/" />;
  }

  if (!game || game.id !== gameId) {
    return <LoadingView />;
  }

  const View = GAME_STATE_VIEWS[game.state];
  return <View />;
};

export default GameContainer;
