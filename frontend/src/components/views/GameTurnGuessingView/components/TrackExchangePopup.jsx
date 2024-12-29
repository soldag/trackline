import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import {
  AspectRatio,
  Button,
  Card,
  CardActions,
  CardContent,
  CardOverflow,
  Typography,
} from "@mui/joy";

import Popup from "~/components/common/Popup";
import TrackCard from "~/components/common/TrackCard";
import { GameType } from "~/types/games";
import { UserType } from "~/types/users";
import { usePrevious } from "~/utils/hooks";

const TrackExchangePopup = ({ game, users, currentUserId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exchangedTrack, setExchangedTrack] = useState();

  const turn = game.turns.at(-1);
  const track = turn?.track;
  const activeUser = users.find((u) => u.id === turn?.activeUserId);
  const isActivePlayer = activeUser != null && activeUser.id === currentUserId;

  const prevTrack = usePrevious(track);
  useEffect(() => {
    if (prevTrack && track && prevTrack.spotifyId !== track.spotifyId) {
      setExchangedTrack(prevTrack);
      setIsOpen(true);
    }
  }, [track, prevTrack]);

  const handleClose = () => setIsOpen(false);

  return (
    <Popup open={isOpen} onClose={handleClose}>
      <Card
        variant="plain"
        sx={{
          "outline": "none",
          "textAlign": "center",
          "alignItems": "center",
          "--TrackExchangePopup-width": "min(400px, calc(100vw - 50px))",
          "width": "var(--TrackExchangePopup-width)",
        }}
      >
        <CardOverflow>
          <AspectRatio ratio="1">
            <TrackCard
              track={exchangedTrack}
              sx={{
                "--TrackCard-radius": 0,
                "--TrackCard-size": "var(--TrackExchangePopup-width)",
              }}
            />
          </AspectRatio>
        </CardOverflow>

        <Typography level="title-lg" sx={{ mt: 1 }}>
          <FormattedMessage
            id="GameTurnGuessingView.TrackExchangePopup.title"
            defaultMessage="Get Ready For The Next Song!"
          />
        </Typography>

        <CardContent>
          {isActivePlayer ? (
            <FormattedMessage
              id="GameTurnGuessingView.TrackExchangePopup.description.active"
              defaultMessage="You have just exchanged this track for a new one. All previous guesses have been discarded."
            />
          ) : (
            <FormattedMessage
              id="GameTurnGuessingView.TrackExchangePopup.description.passive"
              defaultMessage="{username} has just exchanged this track for a new one. All previous guesses have been discarded."
              values={{ username: activeUser?.username }}
            />
          )}
        </CardContent>

        <CardActions sx={{ width: "100%" }}>
          <Button variant="solid" onClick={handleClose}>
            <FormattedMessage
              id="GameTurnGuessingView.TrackExchangePopup.continue"
              defaultMessage="Continue"
            />
          </Button>
        </CardActions>
      </Card>
    </Popup>
  );
};

TrackExchangePopup.propTypes = {
  game: GameType.isRequired,
  users: PropTypes.arrayOf(UserType).isRequired,
  currentUserId: PropTypes.string,
};

export default TrackExchangePopup;
