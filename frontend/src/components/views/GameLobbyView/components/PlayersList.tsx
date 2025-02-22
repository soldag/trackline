import { useMemo } from "react";

import PersonIcon from "@mui/icons-material/Person";
import StarsIcon from "@mui/icons-material/Stars";
import { List, ListItem, ListItemContent, ListItemDecorator } from "@mui/joy";

import { User } from "@/types/users";

const getUsernameComparator =
  (gameMasterId?: string, currentUserId?: string) => (u1: User, u2: User) => {
    const specialUserIds = [gameMasterId, currentUserId];
    if (specialUserIds.includes(u1.id)) {
      return -1 * specialUserIds.indexOf(u1.id);
    }
    if (specialUserIds.includes(u2.id)) {
      return specialUserIds.indexOf(u2.id);
    }

    return u1.username.localeCompare(u2.username);
  };

interface PlayersList {
  users?: User[];
  gameMasterId?: string;
  currentUserId?: string;
}

const PlayersList = ({
  users = [],
  gameMasterId,
  currentUserId,
}: PlayersList) => {
  const usernameComparator = useMemo(
    () => getUsernameComparator(gameMasterId, currentUserId),
    [gameMasterId, currentUserId],
  );
  const sortedUsers = useMemo(
    () => users.slice().sort(usernameComparator),
    [users, usernameComparator],
  );

  return (
    <List>
      {sortedUsers.map((user) => (
        <ListItem
          key={user.id}
          variant={user.id === currentUserId ? "soft" : "plain"}
          color={user.id === currentUserId ? "success" : undefined}
        >
          <ListItemDecorator>
            <PersonIcon
              color={user.id === currentUserId ? "success" : undefined}
            />
          </ListItemDecorator>
          <ListItemContent>{user.username}</ListItemContent>
          {user.id == gameMasterId && <StarsIcon />}
        </ListItem>
      ))}
    </List>
  );
};

export default PlayersList;
