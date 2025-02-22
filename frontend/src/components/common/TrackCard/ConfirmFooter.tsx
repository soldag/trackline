import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { Button, CardContent, Stack } from "@mui/joy";

interface ConfirmFooterProps {
  loadingCancel?: boolean;
  loadingConfirm?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
}

const ConfirmFooter = ({
  loadingCancel = false,
  loadingConfirm = false,
  onCancel = () => {},
  onConfirm = () => {},
}: ConfirmFooterProps) => (
  <CardContent
    sx={{
      flexGrow: 0,
      justifyContent: "flex-end",
    }}
  >
    <Stack direction="row" spacing={1}>
      <Button
        fullWidth
        variant="soft"
        color="danger"
        loading={loadingCancel}
        disabled={loadingCancel}
        onClick={onCancel}
      >
        <CloseIcon />
      </Button>
      <Button
        fullWidth
        variant="soft"
        color="success"
        loading={loadingConfirm}
        disabled={loadingConfirm}
        onClick={onConfirm}
      >
        <CheckIcon />
      </Button>
    </Stack>
  </CardContent>
);

export default ConfirmFooter;
