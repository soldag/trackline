import TokenIcon from "@mui/icons-material/Token";
import WebStoriesIcon from "@mui/icons-material/WebStories";
import { Stack, Typography } from "@mui/joy";

import MaxTokenHint from "@/components/common/MaxTokenHint";
import NumericDelta from "@/components/common/NumericDelta";
import { TokenGain } from "@/types/games";

interface ScoringResultProps {
  tracks?: number;
  tokens?: number;
  tracksDelta?: number;
  tokenCost?: number;
  tokenGain?: TokenGain;
}

const ScoringResult = ({
  tracks,
  tokens,
  tracksDelta = 0,
  tokenCost = 0,
  tokenGain,
}: ScoringResultProps) => {
  const refund = tokenGain?.refund ?? 0;
  const effectiveTokenReward = tokenGain?.rewardEffective ?? 0;
  const theoreticalTokenReward = tokenGain?.rewardTheoretical ?? 0;
  const tokenDelta = refund + effectiveTokenReward - tokenCost;
  const tokenLimitExceeded = effectiveTokenReward < theoreticalTokenReward;

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      flexWrap="wrap"
      sx={{
        "& > :empty": {
          display: "none",
        },
      }}
    >
      {tracks != null && (
        <Typography
          level="body-sm"
          endDecorator={<WebStoriesIcon sx={{ fontSize: "1em" }} />}
        >
          {tracks}
        </Typography>
      )}

      {tokens != null && (
        <Typography
          level="body-sm"
          endDecorator={<TokenIcon sx={{ fontSize: "1em" }} />}
        >
          {tokens}
        </Typography>
      )}

      <Stack direction="row" alignItems="center" spacing={1}>
        {tracksDelta !== 0 && (
          <NumericDelta value={tracksDelta} icon={<WebStoriesIcon />} />
        )}

        {(tokenDelta !== 0 || tokenLimitExceeded) && (
          <NumericDelta
            color={tokenLimitExceeded ? "warning" : null}
            value={tokenDelta}
            icon={<TokenIcon />}
          />
        )}
        {tokenLimitExceeded && <MaxTokenHint />}
      </Stack>
    </Stack>
  );
};

export default ScoringResult;
