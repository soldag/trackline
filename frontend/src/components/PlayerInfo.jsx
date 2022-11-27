import PersonIcon from "@mui/icons-material/Person";
import StarIcon from "@mui/icons-material/Star";
import TokenIcon from "@mui/icons-material/Token";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";

import PlayerType from "types/player";

const PlayerInfo = ({ player }) => (
  <Box>
    <Typography level="body1" fontWeight="lg" startDecorator={<PersonIcon />}>
      {player.name}
    </Typography>
    <Typography level="body2">
      <Typography startDecorator={<StarIcon />} mr={1}>
        {player.points}
      </Typography>
      <Typography startDecorator={<TokenIcon />}>{player.tokens}</Typography>
    </Typography>
  </Box>
);

PlayerInfo.propTypes = {
  player: PlayerType.isRequired,
};

export default PlayerInfo;
