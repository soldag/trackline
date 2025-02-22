import { useState } from "react";
import { FormattedMessage } from "react-intl";

import { Option, Select, Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { tabClasses } from "@mui/joy/Tab";
import { tabPanelClasses } from "@mui/joy/TabPanel";

import GameScoringTable from "@/components/common/GameScoringTable";
import { Player, Turn } from "@/types/games";
import { User } from "@/types/users";
import { useBreakpoint } from "@/utils/hooks";

import CreditsScoringTable from "./CreditsScoringTable";
import ReleaseYearScoringTable from "./ReleaseYearScoringTable";

enum TabValue {
  ReleaseYear = "releaseYear",
  Credits = "credits",
  Game = "game",
}

const HEADERS = {
  [TabValue.Game]: (
    <FormattedMessage
      id="GameTurnScoringView.ScoringTabs.headers.game"
      defaultMessage="Game Scoring"
    />
  ),
  [TabValue.ReleaseYear]: (
    <FormattedMessage
      id="GameTurnScoringView.ScoringTabs.headers.releaseYear"
      defaultMessage="Release Year"
    />
  ),
  [TabValue.Credits]: (
    <FormattedMessage
      id="GameTurnScoringView.ScoringTabs.headers.credits"
      defaultMessage="Credits"
    />
  ),
};

interface ScoringTabsProps {
  players?: Player[];
  users?: User[];
  turn?: Turn;
}

const ScoringTabs = ({ players, users, turn }: ScoringTabsProps) => {
  const isScreenXs = useBreakpoint((breakpoints) => breakpoints.only("xs"));

  const [value, setValue] = useState(TabValue.Game);

  return (
    <Tabs
      size="sm"
      value={value}
      onChange={(_, newValue) => setValue(newValue as TabValue)}
      sx={(theme) => ({
        "overflow": "hidden",
        "borderRadius": "5px",
        "boxShadow": "sm",
        "border": `1px solid ${theme.vars.palette.divider}`,
        "--Tabs-gap": "0px",
        [`& .${tabPanelClasses.root}`]: {
          "p": 0,
          "pt": 1,
          "overflowY": "auto",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          "scrollbarWidth": "none",
        },
      })}
    >
      {isScreenXs ? (
        <Select
          variant="plain"
          value={value}
          onChange={(_, newValue) => setValue(newValue as TabValue)}
          sx={{
            "& button": {
              fontWeight: "lg",
            },
          }}
        >
          {Object.entries(HEADERS).map(([value, header]) => (
            <Option key={value} value={value}>
              {header}
            </Option>
          ))}
        </Select>
      ) : (
        <TabList
          sx={{
            "& button": {
              borderRadius: 0,
            },
            [`& .${tabClasses.root}`]: {
              fontWeight: "lg",
              flex: 1,
              bgcolor: "background.body",
              position: "relative",
              [`&.${tabClasses.selected}`]: {
                color: "primary.500",
              },
              [`&.${tabClasses.selected}:before`]: {
                content: '""',
                display: "block",
                position: "absolute",
                bottom: -1,
                width: "100%",
                height: 2,
                bgcolor: "primary.400",
              },
              [`&.${tabClasses.focusVisible}`]: {
                outlineOffset: "-3px",
              },
            },
          }}
        >
          {Object.entries(HEADERS).map(([value, header]) => (
            <Tab key={value} value={value}>
              {header}
            </Tab>
          ))}
        </TabList>
      )}

      <TabPanel value={TabValue.ReleaseYear}>
        <ReleaseYearScoringTable turn={turn} players={players} users={users} />
      </TabPanel>
      <TabPanel value={TabValue.Credits}>
        <CreditsScoringTable turn={turn} players={players} users={users} />
      </TabPanel>
      <TabPanel value={TabValue.Game}>
        <GameScoringTable turn={turn} players={players} users={users} />
      </TabPanel>
    </Tabs>
  );
};

export default ScoringTabs;
