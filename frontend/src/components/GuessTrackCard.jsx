import PropTypes from "prop-types";
import { useCallback, useState } from "react";
import { FormattedMessage } from "react-intl";

import CheckIcon from "@mui/icons-material/Check";
import PauseIcon from "@mui/icons-material/Pause";
import PlayIcon from "@mui/icons-material/PlayArrow";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import IconButton from "@mui/joy/IconButton";
import Typography from "@mui/joy/Typography";

import ConfirmTrackModel from "components/ConfirmTrackModel";

const GuessTrackCard = ({ isPlaying, onPlay, onPause, onConfirm }) => {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const handleConfirm = useCallback(
    (...args) => {
      setConfirmModalOpen(false);
      onConfirm(...args);
    },
    [setConfirmModalOpen, onConfirm],
  );

  return (
    <>
      <ConfirmTrackModel
        open={confirmModalOpen}
        onConfirm={handleConfirm}
        onClose={() => setConfirmModalOpen(false)}
      />
      <Card
        variant="outlined"
        sx={{
          "height": 250,
          "width": 250,
          "textAlign": "center",
          "flexShrink": 0,
          "--Card-radius": "5px",
        }}
      >
        <CardContent sx={{ justifyContent: "flex-start" }}>
          <Typography level="h1" fontSize="xl">
            <FormattedMessage
              id="components.GuessTrackCard.header"
              defaultMessage="Guess the song!"
            />
          </Typography>
        </CardContent>
        <CardContent sx={{ justifyContent: "center", alignItems: "center" }}>
          <IconButton
            variant="soft"
            size="lg"
            sx={{
              height: "100px",
              width: "100px",
              borderRadius: "50%",
            }}
            onClick={isPlaying ? onPause : onPlay}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </IconButton>
        </CardContent>
        <CardContent sx={{ justifyContent: "flex-end" }}>
          <Button
            variant="soft"
            color="success"
            startDecorator={<CheckIcon />}
            onClick={() => setConfirmModalOpen(true)}
          >
            <FormattedMessage
              id="components.GuessTrackCard.confirm.label"
              defaultMessage="Confirm"
            />
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

GuessTrackCard.propTypes = {
  isPlaying: PropTypes.bool,
  onPlay: PropTypes.func,
  onPause: PropTypes.func,
  onConfirm: PropTypes.func,
};

export default GuessTrackCard;
