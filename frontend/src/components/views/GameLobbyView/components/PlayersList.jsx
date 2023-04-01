import PropTypes from "prop-types";
import { useMemo } from "react";

import PersonIcon from "@mui/icons-material/Person";
import StarIcon from "@mui/icons-material/Star";
import { List, ListItem, ListItemDecorator } from "@mui/joy";

import { UserType } from "types/users";

const getUsernameComparator = (gameMasterId, currentUserId) => (u1, u2) => {
  const specialUserIds = [gameMasterId, currentUserId];
  if (specialUserIds.includes(u1.id)) {
    return -1 * specialUserIds.indexOf(u1.id);
  }
  if (specialUserIds.includes(u2.id)) {
    return specialUserIds.indexOf(u2.id);
  }

  return u1.username.localeCompare(u2.username);
};

const PlayersList = ({ users = [], gameMasterId, currentUserId }) => {
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
          color={user.id === currentUserId ? "success" : null}
        >
          <ListItemDecorator>
            <PersonIcon />
          </ListItemDecorator>
          {user.username}
          {user.id == gameMasterId && <StarIcon sx={{ ml: "3px" }} />}
        </ListItem>
      ))}
    </List>
  );
};

PlayersList.propTypes = {
  users: PropTypes.arrayOf(UserType),
  gameMasterId: PropTypes.string,
  currentUserId: PropTypes.string,
};

export default PlayersList;
