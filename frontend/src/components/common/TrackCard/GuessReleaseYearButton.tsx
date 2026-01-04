import { FormattedMessage } from "react-intl";

import { Button } from "@mui/joy";

import TokenCost from "@/components/common/TokenCost";

interface GuessReleaseYearButtonProps {
  tokenCost?: number;
  disabled?: boolean;
  onClick?: () => void;
}

const GuessReleaseYearButton = ({
  tokenCost = 0,
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
    {tokenCost > 0 && <TokenCost cost={tokenCost} sx={{ ml: 0.5 }} />}
  </Button>
);

export default GuessReleaseYearButton;
