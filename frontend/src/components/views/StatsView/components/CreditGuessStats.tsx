import { FormattedMessage } from "react-intl";

import { Stack } from "@mui/joy";

import { formatDuration, formatPercent } from "@/api/utils/formatters";
import { UserStats } from "@/types/games";

import Heatmap from "./Heatmap";
import StatsGrid from "./StatsGrid";

interface CreditGuessStatsProps {
  stats: UserStats;
}

const CreditGuessStats = ({ stats }: CreditGuessStatsProps) => (
  <Stack justifyContent="space-between" gap={3} sx={{ flexGrow: 1 }}>
    <StatsGrid
      data={[
        {
          key: "timeToGuess",
          label: (
            <FormattedMessage
              id="StatsView.CreditGuessStats.timeToGuess"
              defaultMessage="Time to guess"
            />
          ),
          value: formatDuration(stats.guessStats.credits.meanTimeToGuess),
        },
        {
          key: "accuracy",
          label: (
            <FormattedMessage
              id="StatsView.CreditGuessStats.accuracy"
              defaultMessage="Accuracy"
            />
          ),
          value: formatPercent(stats.guessStats.credits.meanAccuracy),
        },
      ]}
    />
    <Heatmap
      title={
        <FormattedMessage
          id="StatsView.CreditGuessStats.accuracyByYear"
          defaultMessage="Accuracy by Year"
        />
      }
      data={stats.guessStatsByYear}
      countSelector={(x) => x.credits.guessCount}
      valueSelector={(x) => x.credits.meanAccuracy}
      valueFormatter={formatPercent}
    />
  </Stack>
);

export default CreditGuessStats;
