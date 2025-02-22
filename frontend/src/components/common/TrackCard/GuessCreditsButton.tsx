import { FormattedMessage } from "react-intl";

import { Button } from "@mui/joy";

interface GuessReleaseYearButtonProps {
  disabled?: boolean;
  onClick?: () => void;
}

const GuessReleaseYearButton = ({
  disabled = false,
  onClick = () => {},
}: GuessReleaseYearButtonProps) => (
  <Button disabled={disabled} onClick={onClick}>
    <FormattedMessage
      id="TrackCard.GuessCreditsButton.text"
      defaultMessage="Guess artists & title"
    />
  </Button>
);

export default GuessReleaseYearButton;
