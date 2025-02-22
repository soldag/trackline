import { PropsWithChildren } from "react";

import TokenIcon from "@mui/icons-material/Token";
import WebStoriesIcon from "@mui/icons-material/WebStories";
import { Typography } from "@mui/joy";

import MaxTokenHint from "@/components/common/MaxTokenHint";
import NumericDelta from "@/components/common/NumericDelta";
import { TokenGain } from "@/types/games";

interface ScoringResultProps {
  tracksDelta?: number;
  tokenCost?: number;
  tokenGain?: TokenGain;
}

const ScoringResult = ({
  tracksDelta = 0,
  tokenCost = 0,
  tokenGain,
  children,
}: PropsWithChildren<ScoringResultProps>) => {
  const refund = tokenGain?.refund ?? 0;
  const effectiveTokenReward = tokenGain?.rewardEffective ?? 0;
  const theoreticalTokenReward = tokenGain?.rewardTheoretical ?? 0;
  const tokenDelta = refund + effectiveTokenReward - tokenCost;
  const tokenLimitExceeded = effectiveTokenReward < theoreticalTokenReward;

  return (
    <Typography
      fontSize="inherit"
      sx={{
        display: "flex",
        alignItems: "center",
        columnGap: 1,
        flexWrap: "wrap",
      }}
    >
      {children}
      <Typography
        fontSize="inherit"
        sx={{
          display: "flex",
          alignItems: "center",
          columnGap: 1,
        }}
      >
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
      </Typography>
    </Typography>
  );
};

export default ScoringResult;
