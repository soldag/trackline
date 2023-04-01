import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";

import { Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { tabClasses } from "@mui/joy/Tab";

import GameScoringTable from "components/common/GameScoringTable";
import { PlayerType, TurnType } from "types/games";
import { UserType } from "types/users";

import TurnScoringTable from "./TurnScoringTable";

const ScoringTabs = ({ players, users, turn }) => (
  <Tabs
    size="sm"
    defaultValue={0}
    sx={(theme) => ({
      "overflow": "hidden",
      "borderRadius": "5px",
      "boxShadow": "sm",
      "border": `1px solid ${theme.vars.palette.divider}`,
      "--Tabs-gap": "0px",
    })}
  >
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
      <Tab>
        <FormattedMessage
          id="GameTurnScoringView.ScoringTable.headers.turn"
          defaultMessage="Turn Scoring"
        />
      </Tab>
      <Tab>
        <FormattedMessage
          id="GameTurnScoringView.ScoringTable.headers.game"
          defaultMessage="Game Scoring"
        />
      </Tab>
    </TabList>

    <TabPanel
      value={0}
      sx={{
        "mt": "2px",
        "overflowY": "auto",
        "&::-webkit-scrollbar": {
          display: "none",
        },
        "scrollbarWidth": "none",
      }}
    >
      <TurnScoringTable turn={turn} players={players} users={users} />
    </TabPanel>
    <TabPanel
      value={1}
      sx={{
        "pt": "2px",
        "overflowY": "auto",
        "&::-webkit-scrollbar": {
          display: "none",
        },
        "scrollbarWidth": "none",
      }}
    >
      <GameScoringTable turn={turn} players={players} users={users} />
    </TabPanel>
  </Tabs>
);

ScoringTabs.propTypes = {
  players: PropTypes.arrayOf(PlayerType).isRequired,
  users: PropTypes.arrayOf(UserType).isRequired,
  turn: TurnType,
};

export default ScoringTabs;
