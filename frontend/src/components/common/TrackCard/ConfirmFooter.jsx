import PropTypes from "prop-types";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { Button, CardContent, Stack } from "@mui/joy";

const ConfirmFooter = ({
  loadingCancel = false,
  loadingConfirm = false,
  onCancel = () => {},
  onConfirm = () => {},
}) => (
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

ConfirmFooter.propTypes = {
  loadingCancel: PropTypes.bool,
  loadingConfirm: PropTypes.bool,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
};

export default ConfirmFooter;
