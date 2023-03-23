import PropTypes from "prop-types";

import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";

const WinnerTrophy = ({ username }) => (
  <Stack direction="column" alignItems="center">
    <EmojiEventsIcon sx={{ fontSize: "220px", color: "warning.200" }} />
    <Typography level="h4" sx={{ mt: "-25px" }}>
      {username}
    </Typography>
  </Stack>
);

WinnerTrophy.propTypes = {
  username: PropTypes.string,
};

export default WinnerTrophy;
