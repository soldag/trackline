import { FormattedMessage } from "react-intl";

import {
  Avatar,
  AvatarGroup,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/joy";

import UserAvatar from "@/components/common/UserAvatar";
import { User } from "@/types/users";
import { useBreakpoint } from "@/utils/hooks";

interface AwaitedPlayersCardProps {
  users: User[];
}

const AwaitedPlayersCard = ({ users }: AwaitedPlayersCardProps) => {
  const isScreenLg = useBreakpoint((breakpoints) => breakpoints.up("lg"));

  const isWaitingForPlayers = users.length > 0;

  return (
    <Card size="sm" variant="soft">
      <CardContent
        sx={{
          flexDirection: "row",
          alignItems: "center",
          gap: 1,
        }}
      >
        <CircularProgress size="sm" />

        <Typography level="body-sm" fontWeight="lg" sx={{ flexGrow: 1 }}>
          {isWaitingForPlayers ? (
            <FormattedMessage
              id="GameTurnScoringView.AwaitedPlayersCard.waiting"
              defaultMessage="Waiting for {count} {count, plural, one {player} other {players}}..."
              values={{ count: users.length }}
            />
          ) : (
            <FormattedMessage
              id="GameTurnScoringView.AwaitedPlayersCard.startingTurn"
              defaultMessage="Starting next turn..."
            />
          )}
        </Typography>

        {isWaitingForPlayers && (
          <AvatarGroup>
            {users.map((user) => (
              <Avatar key={user.id} size={isScreenLg ? "sm" : "xs"}>
                <UserAvatar username={user.username} />
              </Avatar>
            ))}
          </AvatarGroup>
        )}
      </CardContent>
    </Card>
  );
};

export default AwaitedPlayersCard;
