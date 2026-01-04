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
  <Button disabled={disabled} onClick={onClick}>
    <FormattedMessage
      id="TrackCard.GuessCreditsButton.text"
      defaultMessage="Guess artists & title"
    />
    {tokenCost > 0 && <TokenCost cost={tokenCost} sx={{ ml: 0.5 }} />}
  </Button>
);

export default GuessReleaseYearButton;
