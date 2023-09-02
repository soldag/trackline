import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";

import { Button } from "@mui/joy";

const GuessReleaseYearButton = ({ disabled = false, onClick = () => {} }) => (
  <Button disabled={disabled} onClick={onClick}>
    <FormattedMessage
      id="TrackCard.GuessCreditsButton.text"
      defaultMessage="Guess artists & title"
    />
  </Button>
);

GuessReleaseYearButton.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};

export default GuessReleaseYearButton;
