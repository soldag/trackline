import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Link as RouterLink } from "react-router";

import AlbumIcon from "@mui/icons-material/Album";
import ClearIcon from "@mui/icons-material/Clear";
import LogoutIcon from "@mui/icons-material/Logout";
import { Box, IconButton, Link, Stack } from "@mui/joy";

import { TURN_GAME_STATES } from "@/constants";
import { logout } from "@/store/auth";
import { abortGame, leaveGame } from "@/store/games";
import {
  pause,
  play,
  setVolume,
  unwatchPlayback,
  watchPlayback,
} from "@/store/spotify";
import { useAppDispatch, useAppSelector } from "@/utils/hooks";

import AbortGameModal from "./AbortGameModal";
import LeaveGameModal from "./LeaveGameModal";
import LogoutModal from "./LogoutModal";
import PlayerInfo from "./PlayerInfo";
import SpotifyPlayer from "./SpotifyPlayer";

export interface AppBarProps {
  showTitle?: boolean;
  showPlayerInfo?: boolean;
  showPlaybackControls?: boolean;
  showExitGame?: boolean;
  showLogout?: boolean;
}

const AppBar = ({
  showTitle = false,
  showPlayerInfo = false,
  showPlaybackControls = false,
  showExitGame = false,
  showLogout = false,
}: AppBarProps) => {
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [abortModalOpen, setAbortModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const game = useAppSelector((state) => state.games.game);
  const isSpotifyLoggedIn = useAppSelector((state) => state.spotify.isLoggedIn);
  const {
    isActive: isPlaybackActive,
    isPlaying,
    progress,
    duration,
    volume,
  } = useAppSelector((state) => state.spotify.playback);

  const gameId = game?.id;
  const userId = user?.id;
  const player = game?.players.find((p) => p.userId === user?.id);
  const turn =
    game?.state && TURN_GAME_STATES.includes(game?.state)
      ? game?.turns.at(-1)
      : null;
  const { isGameMaster = false } = player || {};
  const isActivePlayer = turn != null && turn.activeUserId === user?.id;

  useEffect(() => {
    if (!showPlaybackControls || !isSpotifyLoggedIn) return;

    dispatch(watchPlayback());
    return () => {
      dispatch(unwatchPlayback());
    };
  }, [dispatch, showPlaybackControls, isSpotifyLoggedIn]);

  const handleExitGame = () => {
    if (isGameMaster) {
      setAbortModalOpen(true);
    } else {
      setLeaveModalOpen(true);
    }
  };

  const handleAbortGame = () => {
    if (!gameId) return;

    if (isPlaying) {
      dispatch(pause());
    }
    dispatch(abortGame({ gameId }));
  };

  const handleLeaveGame = () => {
    if (!gameId || !userId) return;

    if (isPlaying) {
      dispatch(pause());
    }
    dispatch(leaveGame({ gameId, userId }));
  };

  return (
    <Stack
      direction="row"
      justifyContent="flex-start"
      alignItems="center"
      spacing={1}
      sx={{
        width: "100vw",
        padding: "10px",
        backgroundColor: "primary.softBg",
        borderBottom: "1px solid",
        borderBottomColor: "primary.softColor",
        boxShadow: "lg",
      }}
    >
      <LogoutModal
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={() => dispatch(logout())}
      />
      <AbortGameModal
        open={abortModalOpen}
        onClose={() => setAbortModalOpen(false)}
        onConfirm={handleAbortGame}
      />
      <LeaveGameModal
        open={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        onConfirm={handleLeaveGame}
      />

      <Link component={RouterLink} to="/">
        <AlbumIcon color="primary" sx={{ fontSize: "45px" }} />
      </Link>

      {showTitle && (
        <Link
          component={RouterLink}
          to="/"
          level="h1"
          fontSize="xl"
          underline="none"
        >
          <FormattedMessage id="View.AppBar.title" defaultMessage="Trackline" />
        </Link>
      )}

      {showPlayerInfo && game && user && player && (
        <PlayerInfo user={user} player={player} active={isActivePlayer} />
      )}

      <Box sx={{ flexGrow: 1 }} />

      {showPlaybackControls && isPlaybackActive && (
        <SpotifyPlayer
          isPlaying={isPlaying}
          progress={progress}
          duration={duration}
          volume={volume}
          onPlay={() => dispatch(play())}
          onPause={() => dispatch(pause())}
          onVolumeChange={(volume) => dispatch(setVolume({ volume }))}
        />
      )}

      {showExitGame && game && (
        <IconButton color="primary" onClick={handleExitGame}>
          <ClearIcon />
        </IconButton>
      )}

      {showLogout && user && (
        <IconButton color="primary" onClick={() => setLogoutModalOpen(true)}>
          <LogoutIcon />
        </IconButton>
      )}
    </Stack>
  );
};

export default AppBar;
