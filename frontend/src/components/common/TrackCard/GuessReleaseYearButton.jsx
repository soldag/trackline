import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";

import { Button } from "@mui/joy";

const GuessReleaseYearButton = ({ disabled = false, onClick = () => {} }) => (
  <Button
    disabled={disabled}
    sx={{
      borderRadius: "var(--CardOverflow-radius) var(--CardOverflow-radius) 0 0",
    }}
    onClick={onClick}
  >
    <FormattedMessage
      id="TrackCard.GuessReleaseYearButton.text"
      defaultMessage="Guess release year"
    />
  </Button>
);

GuessReleaseYearButton.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};

export default GuessReleaseYearButton;
