import { Box, Modal, ModalDialog } from "@mui/joy";

import ResponsiveQrCode from "@/components/common/ResponsiveQrCode";

interface QrCodeModalProps {
  joinUrl: string;
  open?: boolean;
  onClose?: () => void;
}

const QrCodeModal = ({ joinUrl, open = false, onClose }: QrCodeModalProps) => (
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

export default QrCodeModal;
