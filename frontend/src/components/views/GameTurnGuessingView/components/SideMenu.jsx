import PropTypes from "prop-types";
import { useState } from "react";
import { FormattedMessage } from "react-intl";

import ForwardIcon from "@mui/icons-material/Forward";
import DoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import DoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import LoopIcon from "@mui/icons-material/Loop";
import { List, Stack } from "@mui/joy";

import ExpandableMenuItem from "@/components/common/ExpandableMenuItem";

const SideMenu = ({
  canPassTurn = true,
  showExchangeTrack = true,
  canExchangeTrack = true,
  loadingPassTurn = false,
  loadingExchangeTrack = false,
  onPassTurn = () => {},
  onExchangeTrack = () => {},
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleIsExpanded = () => setIsExpanded((v) => !v);

  return (
    <Stack
      direction="column"
      justifyContent="space-between"
      sx={(theme) => ({
        height: {
          xs: 230,
          md: 300,
          lg: 350,
        },
        marginY: "auto",
        backgroundColor: "primary.softBg",
        color: "primary.softColor",
        borderColor: "primary.softColor",
        borderStyle: "solid",
        borderWidth: "1px 1px 1px 0px",
        borderRadius: "0px 5px 5px 0px",
        boxShadow: theme.shadow.lg,
        zIndex: 1100,
      })}
    >
      <List sx={{ whiteSpace: "nowrap" }}>
        <ExpandableMenuItem
          isExpanded={isExpanded}
          loading={loadingPassTurn}
          disabled={!canPassTurn || loadingPassTurn}
          icon={<ForwardIcon />}
          label={
            <FormattedMessage
              id="GameTurnGuessingView.SideMenu.passTurn"
              defaultMessage="Pass turn"
            />
          }
          onClick={onPassTurn}
        />

        {showExchangeTrack && (
          <ExpandableMenuItem
            isExpanded={isExpanded}
            loading={loadingExchangeTrack}
            disabled={!canExchangeTrack || loadingExchangeTrack}
            icon={<LoopIcon />}
            label={
              <FormattedMessage
                id="GameTurnGuessingView.SideMenu.exchange"
                defaultMessage="Exchange track"
              />
            }
            onClick={onExchangeTrack}
          />
        )}

        <div />

        <ExpandableMenuItem
          sx={{ mt: "auto" }}
          isExpanded={isExpanded}
          icon={isExpanded ? <DoubleArrowLeftIcon /> : <DoubleArrowRightIcon />}
          label={
            <FormattedMessage
              id="GameTurnGuessingView.SideMenu.shrink"
              defaultMessage="Shrink"
            />
          }
          onClick={handleToggleIsExpanded}
        />
      </List>
    </Stack>
  );
};

SideMenu.propTypes = {
  canPassTurn: PropTypes.bool,
  showExchangeTrack: PropTypes.bool,
  canExchangeTrack: PropTypes.bool,
  loadingPassTurn: PropTypes.bool,
  loadingExchangeTrack: PropTypes.bool,
  onPassTurn: PropTypes.func,
  onExchangeTrack: PropTypes.func,
};

export default SideMenu;
