import { useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { useParams } from "react-router";

import { Button, Stack } from "@mui/joy";

import AppNavigate from "@/components/common/AppNavigate";
import ErrorAlert from "@/components/common/ErrorAlert";
import View from "@/components/views/View";
import { JOIN_CODE_REGEX } from "@/constants";
import { dismissError } from "@/store/errors";
import { joinGame } from "@/store/games";
import {
  useAppDispatch,
  useAppNavigate,
  useAppSelector,
  useErrorSelector,
} from "@/utils/hooks";

const JoinGameLinkView = () => {
  const navigate = useAppNavigate();
  const { joinCode } = useParams();

  const dispatch = useAppDispatch();
  const game = useAppSelector((state) => state.games.game);
  const { error } = useErrorSelector(joinGame);

  useEffect(() => {
    if (joinCode?.match(JOIN_CODE_REGEX)) {
      dispatch(joinGame({ joinCode }));
    } else {
      navigate("/games/join", { replace: true });
    }
  }, [joinCode, dispatch, navigate]);

  const handleDismissError = () => {
    dispatch(dismissError({ typePrefix: joinGame.typePrefix }));
    navigate("/games/join", { replace: true });
  };

  if (game && game.joinCode === joinCode) {
    return <AppNavigate replace to={`/games/${game.id}`} />;
  }

  return (
    <View
      appBar={{
        title: (
          <FormattedMessage
            id="JoinGameLinkView.title"
            defaultMessage="Join existing game"
          />
        ),
        showBack: true,
        showLogout: true,
      }}
      loading={!error}
    >
      <Stack justifyContent="space-between">
        <ErrorAlert
          header={
            <FormattedMessage
              id="JoinGameLinkView.errorAlert.header"
              defaultMessage="Failed to join the game"
            />
          }
          error={error}
        />
        <Button
          fullWidth
          color="neutral"
          variant="soft"
          onClick={handleDismissError}
        >
          <FormattedMessage
            id="JoinGameLinkView.scanOrEnter"
            defaultMessage="Scan or enter game code"
          />
        </Button>
      </Stack>
    </View>
  );
};

export default JoinGameLinkView;
