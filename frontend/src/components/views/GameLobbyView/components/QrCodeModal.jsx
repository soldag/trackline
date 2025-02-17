import PropTypes from "prop-types";

import { Box, Modal, ModalDialog } from "@mui/joy";

import ResponsiveQrCode from "@/components/common/ResponsiveQrCode";

const QrCodeModal = ({ joinUrl, open, onClose }) => (
  <Modal open={open} onClose={onClose} onClick={onClose}>
    <ModalDialog
      sx={{
        "display": "flex",
        "flexDirection": "row",
        "alignItems": "stretch",
        "--ModalDialog-minWidth": 0,
      }}
    >
      <Box sx={{ overflow: "hidden" }}>
        <ResponsiveQrCode data={joinUrl} sx={{ maxWidth: "512px" }} />
      </Box>
    </ModalDialog>
  </Modal>
);

QrCodeModal.propTypes = {
  joinUrl: PropTypes.string.isRequired,
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

export default QrCodeModal;
