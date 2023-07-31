import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import { Switch, Typography } from "@mui/joy";

import ConfirmModal from "~/components/common/ConfirmModal";
import YearPicker from "~/components/common/YearPicker";

const getInitialYear = (min, max) => min || max || new Date().getFullYear();

const ConfirmGuessModal = ({
  open,
  minYear,
  maxYear,
  canGuessYear,
  onConfirm,
  onClose,
}) => {
  const [guessYear, setGuessYear] = useState(false);
  const [year, setYear] = useState(getInitialYear(minYear, maxYear));

  useEffect(() => {
    if (!open) {
      setGuessYear(false);
      setYear(getInitialYear(minYear, maxYear));
    }
  }, [open, minYear, maxYear]);

  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={() => onConfirm({ year: guessYear ? year : null })}
      header={
        <FormattedMessage
          id="GameTurnGuessingView.ConfirmGuessModal.header"
          defaultMessage="Confirm track position?"
        />
      }
    >
      <Typography sx={{ mb: 3 }}>
        <FormattedMessage
          id="GameTurnGuessingView.ConfirmGuessModal.mainContent"
          defaultMessage="Do you want to confirm the position of the track that is playing?"
        />
      </Typography>

      <Switch
        sx={{ mb: 1 }}
        variant="soft"
        endDecorator={
          <FormattedMessage
            id="GameTurnGuessingView.ConfirmGuessModal.releaseYear.label"
            defaultMessage="You can earn an extra token when correctly guessing the exact release year."
          />
        }
        disabled={!canGuessYear}
        checked={guessYear}
        onChange={({ target: { checked } }) => setGuessYear(checked)}
      />

      <YearPicker
        value={year}
        min={minYear}
        max={maxYear}
        disabled={!guessYear}
        onChange={setYear}
      />
    </ConfirmModal>
  );
};

ConfirmGuessModal.propTypes = {
  open: PropTypes.bool,
  minYear: PropTypes.number,
  maxYear: PropTypes.number,
  canGuessYear: PropTypes.bool,
  onConfirm: PropTypes.func,
  onClose: PropTypes.func,
};

export default ConfirmGuessModal;
