import PropTypes from "prop-types";
import { defineMessages, useIntl } from "react-intl";

import EqualizerIcon from "@mui/icons-material/Equalizer";
import PendingIcon from "@mui/icons-material/Pending";
import VerifiedIcon from "@mui/icons-material/Verified";
import Typography from "@mui/joy/Typography";

import { GAME_STATUSES } from "constants";

const ICONS = {
  [GAME_STATUSES.START_PENDING]: <PendingIcon />,
  [GAME_STATUSES.GUESSING]: <EqualizerIcon />,
  [GAME_STATUSES.CONTESTING]: <VerifiedIcon />,
};

const LABELS = {
  [GAME_STATUSES.START_PENDING]: defineMessages({
    true: {
      id: "StatusBar.label.pendingStart.active",
      defaultMessage: "Waiting for other players...",
    },
    false: {
      id: "StatusBar.label.pendingStart.passive",
      defaultMessage: "Waiting for game to start...",
    },
  }),
  [GAME_STATUSES.GUESSING]: defineMessages({
    true: {
      id: "StatusBar.label.guessing.active",
      defaultMessage: "It's your turn to guess!",
    },
    false: {
      id: "StatusBar.label.guessing.passive",
      defaultMessage: "Waiting for {player} to guess...",
    },
  }),
  [GAME_STATUSES.CONTESTING]: defineMessages({
    true: {
      id: "StatusBar.label.contesting.active",
      defaultMessage: "It's your turn to contest!",
    },
    false: {
      id: "StatusBar.label.contesting.passive",
      defaultMessage: "Waiting for other players to contest...",
    },
  }),
};

const StatusBar = ({ status, activePlayer, isActivePlayer }) => {
  const intl = useIntl();

  const labelMessage = LABELS[status] && LABELS[status][isActivePlayer];
  const label = labelMessage
    ? intl.formatMessage(labelMessage, { player: activePlayer })
    : null;

  return (
    <Typography
      level="body2"
      startDecorator={ICONS[status]}
      justifyContent="center"
      sx={{
        minHeight: "var(--joy-fontSize-sm)",
      }}
    >
      {label}
    </Typography>
  );
};

StatusBar.propTypes = {
  status: PropTypes.oneOf(Object.values(GAME_STATUSES)),
  isActivePlayer: PropTypes.bool,
  activePlayer: PropTypes.string,
};

export default StatusBar;
