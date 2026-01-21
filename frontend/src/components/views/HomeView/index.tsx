import { useEffect } from "react";
import { FormattedMessage } from "react-intl";

import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import { Stack, Typography } from "@mui/joy";

import ActionCard from "@/components/common/ActionCard";
import View from "@/components/views/View";
import { fetchActiveGames } from "@/store/games/thunks";
import {
  useAppDispatch,
  useAppSelector,
  useLoadingSelector,
} from "@/utils/hooks";

import GameList from "./components/GameList";

const HomeView = () => {
  const dispatch = useAppDispatch();
  const games = useAppSelector((state) => state.games.activeGames);
  const loading = useLoadingSelector(fetchActiveGames);

  useEffect(() => {
    dispatch(fetchActiveGames());
  }, [dispatch]);

  return (
    <View appBar={{ showTitle: true, showLogout: true }} loading={loading}>
      <Stack
        direction="column"
        justifyContent="center"
        gap={4}
        sx={{ height: "100%", overflow: "hidden" }}
      >
        {games.length > 0 && (
          <Stack direction="column" sx={{ flex: "1 1 0", overflow: "hidden" }}>
            <Typography level="title-lg" sx={{ mb: 1 }}>
              <FormattedMessage
                id="HomeView.activeGames"
                defaultMessage="Your active games"
              />
            </Typography>
            <GameList games={games} sx={{ flexShrink: 1, overflow: "auto" }} />
          </Stack>
        )}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <ActionCard
            color="primary"
            variant="solid"
            startDecorator={<PlaylistAddIcon />}
            endDecorator={<NavigateNextIcon />}
            title={
              <FormattedMessage
                id="HomeView.createGame.title"
                defaultMessage="Create new game"
              />
            }
            description={
              <FormattedMessage
                id="HomeView.createGame.description"
                defaultMessage="Start a new game and invite your friends!"
              />
            }
            sx={{ flexGrow: { sm: 1 }, flexBasis: 0 }}
            linkTo="/games/new"
          />

          <ActionCard
            color="primary"
            variant="soft"
            startDecorator={<MeetingRoomIcon />}
            endDecorator={<NavigateNextIcon />}
            title={
              <FormattedMessage
                id="HomeView.joinGame.title"
                defaultMessage="Join existing game"
              />
            }
            description={
              <FormattedMessage
                id="HomeView.joinGame.description"
                defaultMessage="Enter a game code to join an existing game!"
              />
            }
            sx={{ flexGrow: { sm: 1 }, flexBasis: 0 }}
            linkTo="/games/join"
          />
        </Stack>
      </Stack>
    </View>
  );
};

export default HomeView;
