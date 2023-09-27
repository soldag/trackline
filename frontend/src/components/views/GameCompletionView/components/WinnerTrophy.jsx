import PropTypes from "prop-types";

import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Stack, Typography } from "@mui/joy";

const WinnerTrophy = ({ username }) => (
  <Stack direction="column" alignItems="center">
    <EmojiEventsIcon sx={{ fontSize: "220px", color: "warning.400" }} />
    <Typography fontSize="xl" fontWeight="lg" sx={{ mt: -3 }}>
      {username}
    </Typography>
  </Stack>
);

WinnerTrophy.propTypes = {
  username: PropTypes.string,
};

export default WinnerTrophy;
