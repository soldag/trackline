import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import { Typography } from "@mui/joy";

import YearPicker from "@/components/common/YearPicker";
import { Track } from "@/types/games";

import GuessModal from "./GuessModal";

const getInitialYear = (min: number, max: number): number =>
  min || max || new Date().getFullYear();

interface GuessReleaseYearModalProps {
  open?: boolean;
  playerTokens?: number;
  tracks?: Track[];
  activeTrackId?: string;
  tokenCost?: number;
  onConfirm?: (args: { position: number; year: number }) => void;
  onClose?: () => void;
}

const GuessReleaseYearModal = ({
  open,
  playerTokens,
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
    <GuessModal
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
      playerTokens={playerTokens}
    >
      <Typography sx={{ mb: 2 }}>
        <FormattedMessage
          id="GameTurnGuessingView.GuessReleaseYearModal.content"
          defaultMessage="You can earn an extra token when guessing the exact year the playing track has been released. You cannot loose any token even if you're wrong."
        />
      </Typography>

      <YearPicker value={year} min={minYear} max={maxYear} onChange={setYear} />
    </GuessModal>
  );
};

export default GuessReleaseYearModal;
