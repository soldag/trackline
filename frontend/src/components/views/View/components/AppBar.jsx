import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

import AlbumIcon from "@mui/icons-material/Album";
import ClearIcon from "@mui/icons-material/Clear";
import LogoutIcon from "@mui/icons-material/Logout";
import { Box, IconButton, Stack, Typography } from "@mui/joy";

import { TURN_GAME_STATES } from "@/constants";
import { logout } from "@/store/auth/actions";
import { abortGame, leaveGame } from "@/store/games/actions";
import {
  pause,
  play,
  setVolume,
  unwatchPlayback,
  watchPlayback,
} from "@/store/spotify/actions";

import AbortGameModal from "./AbortGameModal";
import LeaveGameModal from "./LeaveGameModal";
import LogoutModal from "./LogoutModal";
import PlayerInfo from "./PlayerInfo";
import SpotifyPlayer from "./SpotifyPlayer";

const AppBar = ({
  showTitle = false,
  showPlayerInfo = false,
  showPlaybackControls = false,
  showExitGame = false,
  showLogout = false,
}) => {
  const navigate = useNavigate();

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [abortModalOpen, setAbortModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const game = useSelector((state) => state.games.game);
  const isSpotifyLoggedIn = useSelector((state) => state.spotify.isLoggedIn);
  const isPlaybackActive = useSelector(
    (state) => state.spotify.playback.isActive,
  );
  const isPlaying = useSelector((state) => state.spotify.playback.isPlaying);
  const progress = useSelector((state) => state.spotify.playback.progress);
  const duration = useSelector((state) => state.spotify.playback.duration);
  const volume = useSelector((state) => state.spotify.playback.volume);

  const gameId = game?.id;
  const userId = user?.id;
  const player = game?.players.find((p) => p.userId === user?.id);
  const turn = TURN_GAME_STATES.includes(game?.state)
    ? game.turns.at(-1)
    : null;
  const { isGameMaster = false } = player || {};
  const isActivePlayer = turn != null && turn.activeUserId === user?.id;

  useEffect(() => {
    if (!showPlaybackControls || !isSpotifyLoggedIn) return;

    dispatch(watchPlayback());
    return () => dispatch(unwatchPlayback());
  }, [dispatch, showPlaybackControls, isSpotifyLoggedIn]);

  const handleLogoClick = () => {
    if (!game) {
      navigate("/");
    } else {
      handleExitGame();
    }
  };

  const handleExitGame = () => {
    if (isGameMaster) {
      setAbortModalOpen(true);
    } else {
      setLeaveModalOpen(true);
    }
  };

  const handleAbortGame = () => {
    if (isPlaying) {
      dispatch(pause());
    }
    dispatch(abortGame({ gameId }));
  };

  const handleLeaveGame = () => {
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

      <AlbumIcon
        color="primary"
        sx={{ fontSize: "45px", cursor: "pointer" }}
        onClick={handleLogoClick}
      />

      {showTitle && (
        <Typography level="h1" fontSize="xl">
          <FormattedMessage id="View.AppBar.title" defaultMessage="Trackline" />
        </Typography>
      )}

      {showPlayerInfo && game && (
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

AppBar.propTypes = {
  showTitle: PropTypes.bool,
  showPlayerInfo: PropTypes.bool,
  showPlaybackControls: PropTypes.bool,
  showExitGame: PropTypes.bool,
  showLogout: PropTypes.bool,
};

export default AppBar;
