import PropTypes from "prop-types";

import FlagIcon from "@mui/icons-material/Flag";
import PersonIcon from "@mui/icons-material/Person";
import TokenIcon from "@mui/icons-material/Token";
import WebStoriesIcon from "@mui/icons-material/WebStories";
import { Box, Typography } from "@mui/joy";

import { PlayerType } from "types/games";
import { UserType } from "types/users";

const PlayerInfo = ({ player, user, active = false }) => (
  <Box>
    <Typography
      level="body1"
      fontWeight="lg"
      startDecorator={<PersonIcon />}
      endDecorator={active && <FlagIcon />}
      sx={{ color: "inherit" }}
    >
      {user.username}
    </Typography>
    <Typography level="body2" sx={{ color: "inherit" }}>
      <Typography startDecorator={<WebStoriesIcon />} mr={1}>
        {player.timeline.length}
      </Typography>
      <Typography startDecorator={<TokenIcon />}>{player.tokens}</Typography>
    </Typography>
  </Box>
);

PlayerInfo.propTypes = {
  player: PlayerType.isRequired,
  user: UserType.isRequired,
  active: PropTypes.bool,
};

export default PlayerInfo;