import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import Typography from "@mui/joy/Typography";

import YearPicker from "components/YearPicker";

const ConfirmTrackModel = ({ open, onConfirm, onClose }) => {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!open) {
      setYear(new Date().getFullYear());
    }
  }, [open]);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        sx={{ "maxWidth": "500px", "--ModalDialog-minWidth": "400px" }}
      >
        <Typography
          component="h2"
          level="inherit"
          fontSize="1.25em"
          mb="0.25em"
        >
          <FormattedMessage
            id="components.ConfirmTrackModel.header"
            defaultMessage="Confirm track position?"
          />
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Typography sx={{ mb: 1 }}>
          <FormattedMessage
            id="components.ConfirmTrackModel.mainContent"
            defaultMessage="Do you want to confirm the position of the track that is playing?"
          />
        </Typography>

        <Typography sx={{ mb: 1 }}>
          <FormattedMessage
            id="components.ConfirmTrackModel.release_year.label"
            defaultMessage="You can earn an extra token when correctly guessing the exact release year."
          />
        </Typography>

        <YearPicker value={year} onChange={setYear} />
        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button variant="soft" color="neutral" onClick={onClose}>
            <FormattedMessage
              id="components.ConfirmTrackModel.cancel"
              defaultMessage="Cancel"
            />
          </Button>
          <Button color="success" onClick={() => onConfirm({ year })}>
            <FormattedMessage
              id="components.ConfirmTrackModel.confirm"
              defaultMessage="Confirm"
            />
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

ConfirmTrackModel.propTypes = {
  open: PropTypes.bool,
  onConfirm: PropTypes.func,
  onClose: PropTypes.func,
};

export default ConfirmTrackModel;
