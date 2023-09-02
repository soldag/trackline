import PropTypes from "prop-types";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { Button, CardContent } from "@mui/joy";

const ConfirmFooter = ({
  loadingCancel = false,
  loadingConfirm = false,
  onCancel = () => {},
  onConfirm = () => {},
}) => (
  <CardContent
    sx={{
      "justifyContent": "flex-end",
      "flexGrow": 0,
      "flexDirection": "row",
      "& button": {
        flexGrow: 1,
      },
    }}
  >
    <Button
      variant="soft"
      color="danger"
      loading={loadingCancel}
      disabled={loadingCancel}
      onClick={onCancel}
    >
      <CloseIcon />
    </Button>
    <Button
      variant="soft"
      color="success"
      loading={loadingConfirm}
      disabled={loadingConfirm}
      onClick={onConfirm}
    >
      <CheckIcon />
    </Button>
  </CardContent>
);

ConfirmFooter.propTypes = {
  loadingCancel: PropTypes.bool,
  loadingConfirm: PropTypes.bool,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
};

export default ConfirmFooter;
