import { FormattedMessage } from "react-intl";
import MediaQuery from "react-responsive";

import {
  Box,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  tabClasses,
  useTheme,
} from "@mui/joy";

import StatsCard from "@/components/views/StatsView/components/StatsCard";
import { UserStats } from "@/types/games";

import CreditGuessStats from "./CreditGuessStats";
import ReleaseYearGuessStats from "./ReleaseYearGuessStats";

interface GuessStatsCardProps {
  stats: UserStats;
}

const GuessStatsCard = ({ stats }: GuessStatsCardProps) => {
  const theme = useTheme();

  const panes = [
    {
      key: "releaseYear",
      title: (
        <FormattedMessage
          id="StatsView.GuessStatsCard.releaseYear.title"
          defaultMessage="Release Year"
        />
      ),
      content: <ReleaseYearGuessStats stats={stats} />,
    },
    {
      key: "credits",
      title: (
        <FormattedMessage
          id="StatsView.GuessStatsCard.credits.title"
          defaultMessage="Credits"
        />
      ),
      content: <CreditGuessStats stats={stats} />,
    },
  ];

  return (
    <Box>
      <MediaQuery maxWidth={theme.breakpoints.values.sm}>
        <Tabs
          variant="outlined"
          defaultValue="releaseYear"
          sx={{
            borderRadius: "md",
            boxShadow: "sm",
            overflow: "auto",
          }}
        >
          <TabList
            disableUnderline
            tabFlex={1}
            sx={{
              [`& .${tabClasses.root}`]: {
                fontSize: "sm",
                fontWeight: "lg",
                [`&[aria-selected="true"]`]: {
                  color: "primary.500",
                  bgcolor: "background.surface",
                },
                [`&.${tabClasses.focusVisible}`]: {
                  outlineOffset: "-4px",
                },
              },
            }}
          >
            {panes.map(({ key, title }) => (
              <Tab
                disableIndicator
                key={key}
                value={key}
                variant="soft"
                sx={{ flexGrow: 1 }}
              >
                {title}
              </Tab>
            ))}
          </TabList>

          {panes.map(({ key, content }) => (
            <TabPanel key={key} value={key}>
              {content}
            </TabPanel>
          ))}
        </Tabs>
      </MediaQuery>
      <MediaQuery minWidth={theme.breakpoints.values.sm}>
        <Stack direction="row" gap={1}>
          {panes.map(({ key, title, content }) => (
            <StatsCard key={key} title={title} sx={{ flexGrow: 1 }}>
              {content}
            </StatsCard>
          ))}
        </Stack>
      </MediaQuery>
    </Box>
  );
};

export default GuessStatsCard;
