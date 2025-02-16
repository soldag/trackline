import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router";

import GameAbortView from "~/components/views/GameAbortView";
import GameCompletionView from "~/components/views/GameCompletionView";
import GameLobbyView from "~/components/views/GameLobbyView";
import GameTurnGuessingView from "~/components/views/GameTurnGuessingView";
import GameTurnScoringView from "~/components/views/GameTurnScoringView";
import LoadingView from "~/components/views/LoadingView";
import { GAME_STATES } from "~/constants";
import {
  clearGame,
  fetchGame,
  fetchGameUsers,
  listenNotifications,
  unlistenNotifications,
} from "~/store/games/actions";
import { pause } from "~/store/spotify/actions";
import { usePrevious, useSpotify, useUnmountEffect } from "~/utils/hooks";

const GAME_STATE_VIEWS = {
  [GAME_STATES.WAITING_FOR_PLAYERS]: GameLobbyView,
  [GAME_STATES.STARTED]: LoadingView,
  [GAME_STATES.GUESSING]: GameTurnGuessingView,
  [GAME_STATES.SCORING]: GameTurnScoringView,
  [GAME_STATES.COMPLETED]: GameCompletionView,
  [GAME_STATES.ABORTED]: GameAbortView,
};

const GameContainer = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const game = useSelector((state) => state.games.game);

  const currentPlayer = game?.players.find((p) => p.userId === user?.id);
  const { isGameMaster = false } = currentPlayer || {};

  useSpotify({ requireAuth: isGameMaster });

  useEffect(() => {
    if (!gameId) return;

    dispatch(fetchGame({ gameId }));
    dispatch(fetchGameUsers({ gameId }));
    dispatch(listenNotifications({ gameId }));

    return () => {
      dispatch(clearGame());
      dispatch(unlistenNotifications());
    };
  }, [dispatch, gameId]);

  const prevGame = usePrevious(game);
  useEffect(() => {
    if (prevGame && !game) {
      navigate("/");
    }
  }, [prevGame, game, navigate]);

  useUnmountEffect(() => {
    if (isGameMaster) {
      return () => dispatch(pause());
    }
  }, [isGameMaster]);

  if (!gameId) {
    return <Navigate to="/" />;
  }

  if (!game || game.id !== gameId) {
    return <LoadingView />;
  }

  const View = GAME_STATE_VIEWS[game.state];
  return <View />;
};

export default GameContainer;
