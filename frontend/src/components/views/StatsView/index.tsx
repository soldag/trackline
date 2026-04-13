import { Duration } from "luxon";
import { useEffect } from "react";
import { FormattedMessage } from "react-intl";

import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import NumbersIcon from "@mui/icons-material/Numbers";
import TimerIcon from "@mui/icons-material/Timer";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import { Box, Stack } from "@mui/joy";

import { formatPercent } from "@/api/utils/formatters";
import View from "@/components/views/View";
import { fetchUserStats } from "@/store/games/thunks";
import { UserStats } from "@/types/games";
import {
  useAppDispatch,
  useAppSelector,
  useErrorToast,
  useLoadingSelector,
} from "@/utils/hooks";

import GuessStatsCard from "./components/GuessStatsCard";
import MetricCard from "./components/MetricCard";
import OverviewCard from "./components/OverviewCard";

const getWinRate = (stats: UserStats) => {
  const { wonGames, totalGames } = stats;
  return totalGames > 0 ? wonGames / totalGames : 0;
};

const getTimeToGuess = (stats: UserStats) => {
  const parsedValues = [
    stats.guessStats.credits.meanTimeToGuess,
    stats.guessStats.releaseYear.meanTimeToGuess,
  ]
    .filter((x) => x != null)
    .map((x) => Duration.fromISO(x))
    .filter((x) => x.isValid);

  const totalMillis = parsedValues.reduce(
    (acc, curr) => acc + curr.toMillis(),
    0,
  );
  const avgMillis = totalMillis / parsedValues.length;

  return Duration.fromMillis(avgMillis).toFormat("mm:ss");
};

const getAccuracy = (stats: UserStats) => {
  const values = [
    stats.guessStats.credits.meanAccuracy,
    stats.guessStats.releaseYear.positionMeanAccuracy,
  ].filter((x) => x != null);

  const total = values.reduce((acc, curr) => acc + curr, 0);
  return total / values.length;
};

const StatsView = () => {
  const dispatch = useAppDispatch();
  const stats = useAppSelector((state) => state.games.stats);
  const loading = useLoadingSelector(fetchUserStats);
  useErrorToast(fetchUserStats);

  useEffect(() => {
    dispatch(fetchUserStats());
  }, [dispatch]);

  return (
    <View
      appBar={{ showTitle: true, showLogout: true }}
      loading={loading && !stats}
      header={
        <FormattedMessage id="StatsView.header" defaultMessage="Statistics" />
      }
    >
      {stats && (
        <Stack
          direction="column"
          justifyContent="space-between"
          spacing={2}
          sx={{
            height: "100%",
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 2,
            }}
          >
            <MetricCard
              label={
                <FormattedMessage
                  id="StatsView.totalGames"
                  defaultMessage="Total Games"
                />
              }
              icon={<NumbersIcon />}
              value={stats.totalGames}
            />
            <MetricCard
              label={
                <FormattedMessage
                  id="StatsView.winRate"
                  defaultMessage="Win Rate"
                />
              }
              icon={<EmojiEventsIcon />}
              value={formatPercent(getWinRate(stats))}
            />
            <MetricCard
              label={
                <FormattedMessage
                  id="StatsView.timeToGuess"
                  defaultMessage="Time to Guess"
                />
              }
              icon={<TimerIcon />}
              value={getTimeToGuess(stats)}
            />
            <MetricCard
              label={
                <FormattedMessage
                  id="StatsView.accuracy"
                  defaultMessage="Accuracy"
                />
              }
              icon={<TrackChangesIcon />}
              value={formatPercent(getAccuracy(stats))}
            />
          </Box>

          <OverviewCard stats={stats} />

          <GuessStatsCard stats={stats} />
        </Stack>
      )}
    </View>
  );
};

export default StatsView;
