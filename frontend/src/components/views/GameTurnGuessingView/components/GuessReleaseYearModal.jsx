import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import { Typography } from "@mui/joy";

import ConfirmModal from "@/components/common/ConfirmModal";
import YearPicker from "@/components/common/YearPicker";
import { TrackType } from "@/types/games";

const getInitialYear = (min, max) => min || max || new Date().getFullYear();

const GuessReleaseYearModal = ({
  open,
  tracks,
  activeTrackId,
  onConfirm,
  onClose,
}) => {
  const position = tracks.findIndex((t) => t.spotifyId === activeTrackId);
  const minYear = tracks[position - 1]?.releaseYear;
  const maxYear = tracks[position + 1]?.releaseYear;

  const [year, setYear] = useState(getInitialYear(minYear, maxYear));

  const handleConfirm = () => {
    onConfirm({ position, year });
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

GuessReleaseYearModal.propTypes = {
  open: PropTypes.bool,
  tracks: PropTypes.arrayOf(TrackType),
  activeTrackId: PropTypes.string,
  onConfirm: PropTypes.func,
  onClose: PropTypes.func,
};

export default GuessReleaseYearModal;
