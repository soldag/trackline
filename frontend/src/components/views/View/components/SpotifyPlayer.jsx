import PropTypes from "prop-types";

import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { IconButton, LinearProgress, Stack, Typography } from "@mui/joy";

import FormattedDuration from "@/components/common/FormattedDuration";

const VOLUME_STEP = 0.1;

const SpotifyPlayer = ({
  isPlaying,
  progress,
  duration,
  volume,
  onPlay,
  onPause,
  onVolumeChange,
}) => {
  const handleVolumeDown = () => {
    onVolumeChange(Math.max(volume - VOLUME_STEP, 0));
  };

  const handleVolumeUp = () => {
    onVolumeChange(Math.min(volume + VOLUME_STEP, 1));
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      {isPlaying ? (
        <IconButton color="primary" onClick={onPause}>
          <PauseIcon />
        </IconButton>
      ) : (
        <IconButton color="primary" onClick={onPlay}>
          <PlayArrowIcon />
        </IconButton>
      )}

      <Stack
        direction="row"
        alignItems="center"
        sx={{
          mx: "2",
          display: {
            xs: "none",
            sm: "flex",
          },
        }}
      >
        <Typography level="body-xs" color="primary" sx={{ minWidth: "34px" }}>
          <FormattedDuration ms={progress} />
        </Typography>

        <LinearProgress
          determinate
          value={!progress || !duration ? 0 : (progress / duration) * 100}
          size="sm"
          variant="plain"
          sx={{
            width: {
              sm: "150px",
              md: "200px",
              lg: "300px",
              xl: "400px",
            },
            mx: "10px",
            backgroundColor: "white",
          }}
        />

        <Typography level="body-xs" color="primary" sx={{ minWidth: "34px" }}>
          <FormattedDuration ms={duration} />
        </Typography>
      </Stack>

      <IconButton
        color="primary"
        disabled={volume === 0}
        sx={{
          display: {
            xs: "none",
            sm: "flex",
          },
        }}
        onClick={handleVolumeDown}
      >
        <VolumeDownIcon />
      </IconButton>

      <LinearProgress
        determinate
        value={volume * 100}
        size="sm"
        variant="plain"
        sx={{
          display: {
            xs: "none",
            sm: "flex",
          },
          width: {
            sm: "75px",
            lg: "100px",
          },
          mx: "5px",
          backgroundColor: "white",
        }}
      />
      <IconButton
        color="primary"
        disabled={volume === 1}
        sx={{
          display: {
            xs: "none",
            sm: "flex",
          },
        }}
        onClick={handleVolumeUp}
      >
        <VolumeUpIcon />
      </IconButton>
    </Stack>
  );
};

SpotifyPlayer.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  progress: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  volume: PropTypes.number.isRequired,
  onPlay: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  onVolumeChange: PropTypes.func.isRequired,
};

export default SpotifyPlayer;
