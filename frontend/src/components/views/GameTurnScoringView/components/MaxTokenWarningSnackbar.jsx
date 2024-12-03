import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import { useMediaQuery } from "react-responsive";

import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Box, IconButton, Snackbar, Typography } from "@mui/joy";

const MaxTokenWarningSnackbar = ({ limit, open, onClose }) => {
  const hasSmallHeight = useMediaQuery({ query: "(max-height: 550px)" });

  return (
    <Snackbar
      open={open}
      variant="soft"
      color="warning"
      startDecorator={<WarningAmberIcon />}
      endDecorator={
        <IconButton variant="soft" color="warning" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      }
      anchorOrigin={{
        vertical: "bottom",
        horizontal: hasSmallHeight ? "right" : "center",
      }}
      sx={{
        minWidth: "min(calc(100vw - 2.5rem), 400px)",
        maxWidth: "500px",
      }}
      onClose={onClose}
    >
      <Box>
        <Typography level="title-md" color="inherit">
          <FormattedMessage
            id="GameTurnScoringView.MaxTokenWarningSnackbar.header"
            defaultMessage="Token limit reached"
          />
        </Typography>
        <Typography level="body-sm" color="inherit">
          <FormattedMessage
            id="GameTurnScoringView.MaxTokenWarningSnackbar.message"
            defaultMessage="You cannot have more than {limit, plural, =1 {#{nbsp}token} other {#{nbsp}tokens}}. You should spend some for buying a track."
            values={{ limit, nbsp: <>&nbsp;</> }}
          />
        </Typography>
      </Box>
    </Snackbar>
  );
};

MaxTokenWarningSnackbar.propTypes = {
  limit: PropTypes.number.isRequired,
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

export default MaxTokenWarningSnackbar;
