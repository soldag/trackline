import PropTypes from "prop-types";
import { useState } from "react";
import { FormattedMessage } from "react-intl";

import { Option, Select, Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { tabClasses } from "@mui/joy/Tab";
import { tabPanelClasses } from "@mui/joy/TabPanel";

import GameScoringTable from "@/components/common/GameScoringTable";
import { PlayerType, TurnType } from "@/types/games";
import { UserType } from "@/types/users";
import { useBreakpoint } from "@/utils/hooks";

import CreditsScoringTable from "./CreditsScoringTable";
import ReleaseYearScoringTable from "./ReleaseYearScoringTable";

const VALUES = {
  RELEASE_YEAR: "releaseYear",
  CREDITS: "credits",
  GAME: "game",
};

const HEADERS = {
  [VALUES.GAME]: (
    <FormattedMessage
      id="GameTurnScoringView.ScoringTabs.headers.game"
      defaultMessage="Game Scoring"
    />
  ),
  [VALUES.RELEASE_YEAR]: (
    <FormattedMessage
      id="GameTurnScoringView.ScoringTabs.headers.releaseYear"
      defaultMessage="Release Year"
    />
  ),
  [VALUES.CREDITS]: (
    <FormattedMessage
      id="GameTurnScoringView.ScoringTabs.headers.credits"
      defaultMessage="Credits"
    />
  ),
};

const ScoringTabs = ({ players, users, turn }) => {
  const isScreenXs = useBreakpoint((breakpoints) => breakpoints.only("xs"));

  const [value, setValue] = useState(VALUES.GAME);

  return (
    <Tabs
      size="sm"
      value={value}
      onChange={(e, newValue) => setValue(newValue)}
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
          onChange={(e, newValue) => setValue(newValue)}
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

      <TabPanel value={VALUES.RELEASE_YEAR}>
        <ReleaseYearScoringTable turn={turn} players={players} users={users} />
      </TabPanel>
      <TabPanel value={VALUES.CREDITS}>
        <CreditsScoringTable turn={turn} players={players} users={users} />
      </TabPanel>
      <TabPanel value={VALUES.GAME}>
        <GameScoringTable turn={turn} players={players} users={users} />
      </TabPanel>
    </Tabs>
  );
};

ScoringTabs.propTypes = {
  players: PropTypes.arrayOf(PlayerType).isRequired,
  users: PropTypes.arrayOf(UserType).isRequired,
  turn: TurnType,
};

export default ScoringTabs;
