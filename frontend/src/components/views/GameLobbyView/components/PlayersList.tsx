import { FormattedMessage } from "react-intl";

import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import {
  Box,
  Chip,
  List,
  ListDivider,
  ListItem,
  ListItemContent,
  Typography,
} from "@mui/joy";

import StyledAvatar from "@/components/common/StyledAvatar";
import { User } from "@/types/users";

interface PlayersList {
  users?: User[];
  gameMasterId?: string;
}

const PlayersList = ({ users = [], gameMasterId }: PlayersList) => (
  <List variant="outlined" sx={{ p: 0, borderRadius: "sm" }}>
    {users.map((user, i) => (
      <Box key={user.id}>
        {i > 0 && <ListDivider sx={{ m: 0 }} />}
        <ListItem sx={{ borderRadius: "sm", py: 1.5 }}>
          <ListItemContent
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              overflow: "hidden",
            }}
          >
            <StyledAvatar
              name={user.username}
              variant="beam"
              size={36}
              style={{ flexShrink: 0 }}
            />

            <Typography
              sx={{
                flexShrink: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user.username}
            </Typography>

            {user.id === gameMasterId && (
              <Chip
                size="sm"
                color="primary"
                variant="solid"
                startDecorator={<WorkspacePremiumIcon />}
                sx={{ flexShrink: 0 }}
              >
                <FormattedMessage
                  id="GameLobbyView.PlayersList.gameMaster"
                  defaultMessage="Game master"
                />
              </Chip>
            )}
          </ListItemContent>
        </ListItem>
      </Box>
    ))}
  </List>
);

export default PlayersList;
