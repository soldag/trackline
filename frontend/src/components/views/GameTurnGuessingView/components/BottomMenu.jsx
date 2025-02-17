import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";

import ForwardIcon from "@mui/icons-material/Forward";
import LoopIcon from "@mui/icons-material/Loop";
import { Button, Divider, Stack } from "@mui/joy";

import StatusBar from "@/components/views/GameTurnGuessingView/components/StatusBar";
import { GameType } from "@/types/games";
import { UserType } from "@/types/users";

const BottomMenu = ({
  game,
  users,
  currentUserId,
  canPassTurn = true,
  showExchangeTrack = true,
  canExchangeTrack = true,
  loadingPassTurn = false,
  loadingExchangeTrack = false,
  onPassTurn = () => {},
  onExchangeTrack = () => {},
}) => {
  return (
    <Stack
      direction="column"
      spacing={2}
      sx={{
        p: 2,
        backgroundColor: "primary.softBg",
        color: "primary.softColor",
        borderColor: "primary.softColor",
        borderStyle: "solid",
        borderWidth: "1px 0px 0px 0px",
        borderRadius: "10px 10px 0px 0px",
        boxShadow: `var(--joy-shadowRing, 0 0 #000),
          0px -2px 8px -2px rgba(var(--joy-shadowChannel, 21 21 21) / var(--joy-shadowOpacity, 0.08)),
          0px -12px 16px -4px rgba(var(--joy-shadowChannel,21 21 21) / var(--joy-shadowOpacity,0.08))`,
        zIndex: 1100,
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{
          button: {
            flex: "1 1 0",
          },
        }}
      >
        {showExchangeTrack && (
          <Button
            variant="plain"
            loading={loadingExchangeTrack}
            disabled={!canExchangeTrack || loadingExchangeTrack}
            startDecorator={<LoopIcon />}
            onClick={onExchangeTrack}
          >
            <FormattedMessage
              id="GameTurnGuessingView.BottomMenu.exchange"
              defaultMessage="Exchange track"
            />
          </Button>
        )}
        <Button
          variant="plain"
          loading={loadingPassTurn}
          disabled={!canPassTurn || loadingPassTurn}
          startDecorator={<ForwardIcon />}
          onClick={onPassTurn}
        >
          <FormattedMessage
            id="GameTurnGuessingView.BottomMenu.passTurn"
            defaultMessage="Pass turn"
          />
        </Button>
      </Stack>
      <Divider />
      <StatusBar game={game} users={users} currentUserId={currentUserId} />
    </Stack>
  );
};

BottomMenu.propTypes = {
  game: GameType.isRequired,
  users: PropTypes.arrayOf(UserType).isRequired,
  currentUserId: PropTypes.string,
  canPassTurn: PropTypes.bool,
  showExchangeTrack: PropTypes.bool,
  canExchangeTrack: PropTypes.bool,
  loadingPassTurn: PropTypes.bool,
  loadingExchangeTrack: PropTypes.bool,
  onPassTurn: PropTypes.func,
  onExchangeTrack: PropTypes.func,
};

export default BottomMenu;
