import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import { Typography } from "@mui/joy";

import ConfirmModal from "~/components/common/ConfirmModal";
import YearPicker from "~/components/common/YearPicker";
import { TrackType } from "~/types/games";

const CorrectionProposalModal = ({ open, track, onConfirm, onClose }) => {
  const [releaseYear, setReleaseYear] = useState(track.releaseYear);

  const handleConfirm = () => {
    onClose();
    onConfirm({ releaseYear });
  };

  useEffect(() => {
    if (!open) {
      setReleaseYear(track.releaseYear);
    }
  }, [open, track.releaseYear]);

  return (
    <ConfirmModal
      open={open}
      canConfirm={releaseYear !== track.releaseYear}
      onClose={onClose}
      onConfirm={handleConfirm}
      header={
        <FormattedMessage
          id="GameTurnGuessingView.CorrectionProposalModal.header"
          defaultMessage="Scoring correction"
        />
      }
    >
      <Typography sx={{ mb: 2 }}>
        <FormattedMessage
          id="GameTurnGuessingView.CorrectionProposalModal.content"
          defaultMessage="If you believe the release year is incorrect, you can suggest a different one. If the majority of players agree with your suggestion, the scoring will be updated accordingly."
        />
      </Typography>

      <YearPicker value={releaseYear} onChange={setReleaseYear} />
    </ConfirmModal>
  );
};

CorrectionProposalModal.propTypes = {
  open: PropTypes.bool,
  track: TrackType,
  onConfirm: PropTypes.func,
  onClose: PropTypes.func,
};

export default CorrectionProposalModal;
