import { FormattedMessage } from "react-intl";

import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Box, Stack, Typography } from "@mui/joy";

import { getRankStyle } from "@/style/rankStyles";
import { Player } from "@/types/games";
import { User } from "@/types/users";
import { sortPlayersByRank } from "@/utils/games";

interface WinnerHeaderProps {
  players?: Player[];
  users?: User[];
  currentUserId?: string;
}

const WinnerHeader = ({ players, users, currentUserId }: WinnerHeaderProps) => {
  const goldStyle = getRankStyle(1);

  const winner = sortPlayersByRank(players ?? [])[0];
  const winnerUsername = users?.find((u) => u.id === winner?.userId)?.username;
  const isCurrentUserWinner = !!winner && winner?.userId === currentUserId;

  return (
    <Stack alignItems="center" spacing={1}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          borderRadius: "50%",
          bgcolor: "warning.softBg",
        }}
      >
        <EmojiEventsIcon
          color="warning"
          sx={{ fontSize: "4rem", color: goldStyle?.ring }}
        />
      </Box>

      <Typography level="h1" textAlign="center">
        <FormattedMessage
          id="GameCompletionView.WinnerHeader.header"
          defaultMessage="Congratulations, {username}!"
          values={{
            username: <Typography color="primary">{winnerUsername}</Typography>,
          }}
        />
      </Typography>

      <Typography textColor="text.tertiary" textAlign="center">
        {isCurrentUserWinner ? (
          <FormattedMessage
            id="GameCompletionView.WinnerHeader.description.self"
            defaultMessage="You won the game."
          />
        ) : (
          <FormattedMessage
            id="GameCompletionView.WinnerHeader.description.other"
            defaultMessage="{username} won the game."
            values={{ username: winnerUsername }}
          />
        )}
      </Typography>
    </Stack>
  );
};

export default WinnerHeader;
