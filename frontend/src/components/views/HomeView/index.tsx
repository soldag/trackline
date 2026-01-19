import { FormattedMessage } from "react-intl";
import { Link as RouterLink } from "react-router";

import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import { Link, Stack } from "@mui/joy";

import ActionCard from "@/components/common/ActionCard";
import View from "@/components/views/View";

const HomeView = () => {
  return (
    <View appBar={{ showTitle: true, showLogout: true }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <ActionCard
          color="primary"
          variant="solid"
          startDecorator={<PlaylistAddIcon />}
          endDecorator={<NavigateNextIcon />}
          title={
            <Link
              overlay
              underline="none"
              component={RouterLink}
              to="/games/new"
            >
              <FormattedMessage
                id="HomeView.createGame.title"
                defaultMessage="Create new game"
              />
            </Link>
          }
          description={
            <FormattedMessage
              id="HomeView.createGame.description"
              defaultMessage="Start a new game and invite your friends!"
            />
          }
          sx={{ flexGrow: { sm: 1 } }}
        />

        <ActionCard
          color="primary"
          variant="soft"
          startDecorator={<MeetingRoomIcon />}
          endDecorator={<NavigateNextIcon />}
          title={
            <Link
              overlay
              underline="none"
              component={RouterLink}
              to="/games/join"
            >
              <FormattedMessage
                id="HomeView.joinGame.title"
                defaultMessage="Join existing game"
              />
            </Link>
          }
          description={
            <FormattedMessage
              id="HomeView.joinGame.description"
              defaultMessage="Enter a game code to join an existing game!"
            />
          }
          sx={{ flexGrow: { sm: 1 } }}
        />
      </Stack>
    </View>
  );
};

export default HomeView;
