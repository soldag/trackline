import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Stack, Typography } from "@mui/joy";

interface WinnerTrophyProps {
  username?: string;
}

const WinnerTrophy = ({ username }: WinnerTrophyProps) => (
  <Stack direction="column" alignItems="center">
    <EmojiEventsIcon sx={{ fontSize: "220px", color: "warning.400" }} />
    <Typography fontSize="xl" fontWeight="lg" sx={{ mt: -3 }}>
      {username}
    </Typography>
  </Stack>
);

export default WinnerTrophy;
