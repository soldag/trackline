import { FormattedMessage } from "react-intl";

import TrackPopup from "@/components/common/TrackPopup";
import { Track } from "@/types/games";

interface TrackBoughtPopupProps {
  open: boolean;
  track?: Track | null;
  onClose: () => void;
}

const TrackBoughtPopup = ({ open, track, onClose }: TrackBoughtPopupProps) => {
  return (
    <TrackPopup
      open={open}
      track={track}
      onClose={onClose}
      header={
        <FormattedMessage
          id="GameTurnScoringView.TrackBoughtPopup.title"
          defaultMessage="You got a new track!"
        />
      }
      description={
        <FormattedMessage
          id="GameTurnScoringView.TrackBoughtPopup.description"
          defaultMessage="This track is now part of your timeline."
        />
      }
    />
  );
};

export default TrackBoughtPopup;
