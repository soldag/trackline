import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import TrackPopup from "@/components/common/TrackPopup";
import { Game, Track } from "@/types/games";
import { User } from "@/types/users";
import { usePrevious } from "@/utils/hooks";

interface TrackExchangePopupProps {
  game: Game;
  users?: User[];
  currentUserId?: string;
}

const TrackExchangePopup = ({
  game,
  users = [],
  currentUserId,
}: TrackExchangePopupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exchangedTrack, setExchangedTrack] = useState<Track>();

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

  return (
    <TrackPopup
      open={isOpen}
      track={exchangedTrack}
      header={
        <FormattedMessage
          id="GameTurnGuessingView.TrackExchangePopup.header"
          defaultMessage="Get ready for the next song!"
        />
      }
      description={
        isActivePlayer ? (
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
        )
      }
      onClose={() => setIsOpen(false)}
    />
  );
};

export default TrackExchangePopup;
