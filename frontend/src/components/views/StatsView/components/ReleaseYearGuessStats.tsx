import { FormattedMessage } from "react-intl";

import { Stack } from "@mui/joy";

import { formatDuration, formatPercent } from "@/api/utils/formatters";
import { UserStats } from "@/types/games";

import Heatmap from "./Heatmap";
import StatsGrid from "./StatsGrid";

const formatAccuracy = (
  accuracy: number | null,
  absoluteError: number | null,
) => {
  if (accuracy == null) {
    return null;
  }

  const formattedAccuracy = formatPercent(accuracy);
  if (absoluteError == null) {
    return formattedAccuracy;
  }

  const formattedAbsoluteError = absoluteError?.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formattedAccuracy} (± ${formattedAbsoluteError})`;
};

interface ReleaseYearGuessStatsProps {
  stats: UserStats;
}

const ReleaseYearGuessStats = ({ stats }: ReleaseYearGuessStatsProps) => (
  <Stack justifyContent="space-between" gap={3} sx={{ flexGrow: 1 }}>
    <StatsGrid
      data={[
        {
          key: "timeToGuess",
          label: (
            <FormattedMessage
              id="StatsView.ReleaseYearGuessStats.timeToGuess"
              defaultMessage="Time to guess"
            />
          ),
          value: formatDuration(stats.guessStats.releaseYear.meanTimeToGuess),
        },
        {
          key: "meanAccuracyPosition",
          label: (
            <FormattedMessage
              id="StatsView.ReleaseYearGuessStats.positionAccuracy"
              defaultMessage="Position accuracy"
            />
          ),
          value: formatAccuracy(
            stats.guessStats.releaseYear.positionMeanAccuracy,
            stats.guessStats.releaseYear.positionMeanAbsoluteError,
          ),
        },
        {
          key: "meanAccuracyYear",
          label: (
            <FormattedMessage
              id="StatsView.ReleaseYearGuessStats.yearAccuracy"
              defaultMessage="Year accuracy"
            />
          ),
          value: formatAccuracy(
            stats.guessStats.releaseYear.yearMeanAccuracy,
            stats.guessStats.releaseYear.yearMeanAbsoluteError,
          ),
        },
      ]}
    />
    <Heatmap
      title={
        <FormattedMessage
          id="StatsView.ReleaseYearGuessStatsGuessStats.accuracyByYear"
          defaultMessage="Accuracy by Year"
        />
      }
      data={stats.guessStatsByYear}
      countSelector={(x) => x.releaseYear.guessCount}
      valueSelector={(x) => x.releaseYear.positionMeanAccuracy}
      valueFormatter={formatPercent}
    />
  </Stack>
);

export default ReleaseYearGuessStats;
