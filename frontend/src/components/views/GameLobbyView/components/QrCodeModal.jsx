import PropTypes from "prop-types";

import { Modal, ModalDialog } from "@mui/joy";

import ResponsiveQrCode from "components/common/ResponsiveQrCode";

const QrCodeModal = ({ joinUrl, open, onClose }) => (
  <Modal open={open} onClose={onClose} onClick={onClose}>
    <ModalDialog>
      <ResponsiveQrCode data={joinUrl} sx={{ maxWidth: "512px" }} />
    </ModalDialog>
  </Modal>
);

QrCodeModal.propTypes = {
  joinUrl: PropTypes.string.isRequired,
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

export default QrCodeModal;
