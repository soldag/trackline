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

export default GuessReleaseYearButton;
