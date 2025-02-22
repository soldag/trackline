import FlagIcon from "@mui/icons-material/Flag";
import PersonIcon from "@mui/icons-material/Person";
import TokenIcon from "@mui/icons-material/Token";
import WebStoriesIcon from "@mui/icons-material/WebStories";
import { Box, Typography } from "@mui/joy";

import { Player } from "@/types/games";
import { User } from "@/types/users";

interface PlayerInfoProps {
  player: Player;
  user: User;
  active?: boolean;
}

const PlayerInfo = ({ player, user, active = false }: PlayerInfoProps) => (
  <Box>
    <Typography
      level="body-sm"
      fontWeight="lg"
      color="primary"
      startDecorator={<PersonIcon />}
      endDecorator={active && <FlagIcon />}
    >
      {user.username}
    </Typography>
    <Typography level="body-sm" color="primary">
      <Typography startDecorator={<WebStoriesIcon />} mr={1}>
        {player.timeline.length}
      </Typography>
      <Typography startDecorator={<TokenIcon />}>{player.tokens}</Typography>
    </Typography>
  </Box>
);

export default PlayerInfo;
