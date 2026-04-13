import { FormattedMessage } from "react-intl";

import { formatDuration } from "@/api/utils/formatters";
import { UserStats } from "@/types/games";

import StatsCard from "./StatsCard";
import StatsGrid from "./StatsGrid";

interface OverviewCardProps {
  stats: UserStats;
}

const OverviewCard = ({ stats }: OverviewCardProps) => (
  <StatsCard
    title={
      <FormattedMessage
        id="StatsView.OverviewCard.title"
        defaultMessage="Overview"
      />
    }
  >
    <StatsGrid
      data={[
        {
          key: "totalDuration",
          label: (
            <FormattedMessage
              id="StatsView.OverviewCard.totalDuration"
              defaultMessage="Total duration"
            />
          ),
          value: formatDuration(stats.totalDuration),
        },
        {
          key: "totalPlayedTracks",
          label: (
            <FormattedMessage
              id="StatsView.OverviewCard.totalPlayedTracks"
              defaultMessage="Total played tracks"
            />
          ),
          value: stats.totalPlayedTracks,
        },
        {
          key: "totalTimelineTracks",
          label: (
            <FormattedMessage
              id="StatsView.OverviewCard.totalTimelineTracks"
              defaultMessage="Total timeline tracks"
            />
          ),
          value: stats.totalTimelineTracks,
        },
      ]}
    />
  </StatsCard>
);

export default OverviewCard;
