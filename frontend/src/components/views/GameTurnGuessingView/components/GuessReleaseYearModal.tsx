import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import { Typography } from "@mui/joy";

import ConfirmModal from "@/components/common/ConfirmModal";
import YearPicker from "@/components/common/YearPicker";
import { Track } from "@/types/games";

const getInitialYear = (min: number, max: number): number =>
  min || max || new Date().getFullYear();

interface GuessReleaseYearModalProps {
  open?: boolean;
  tracks?: Track[];
  activeTrackId?: string;
  tokenCost?: number;
  onConfirm?: (args: { position: number; year: number }) => void;
  onClose?: () => void;
}

const GuessReleaseYearModal = ({
  open,
  tracks = [],
  activeTrackId,
  tokenCost,
  onConfirm,
  onClose,
}: GuessReleaseYearModalProps) => {
  const position = tracks.findIndex((t) => t.spotifyId === activeTrackId);
  const minYear = tracks[position - 1]?.releaseYear;
  const maxYear = tracks[position + 1]?.releaseYear;

  const [year, setYear] = useState(getInitialYear(minYear, maxYear));

  const handleConfirm = () => {
    onConfirm?.({ position, year });
  };

  useEffect(() => {
    if (!open) {
      setYear(getInitialYear(minYear, maxYear));
    }
  }, [open, minYear, maxYear]);

  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      header={
        <FormattedMessage
          id="GameTurnGuessingView.GuessReleaseYearModal.header"
          defaultMessage="Guess track's release year"
        />
      }
      tokenCost={tokenCost}
    >
      <Typography sx={{ mb: 2 }}>
        <FormattedMessage
          id="GameTurnGuessingView.GuessReleaseYearModal.content"
          defaultMessage="You can earn an extra token when guessing the exact year the playing track has been released. You cannot loose any token even if you're wrong."
        />
      </Typography>

      <YearPicker value={year} min={minYear} max={maxYear} onChange={setYear} />
    </ConfirmModal>
  );
};

export default GuessReleaseYearModal;
