import { useCallback, useState } from "react";
import { FormattedMessage } from "react-intl";

import { Divider, Stack } from "@mui/joy";

import AppNavigate from "@/components/common/AppNavigate";
import View from "@/components/views/View";
import { dismissError } from "@/store/errors";
import { joinGame } from "@/store/games";
import {
  useAppDispatch,
  useAppSelector,
  useBreakpoint,
  useErrorSelector,
  useLoadingSelector,
} from "@/utils/hooks";

import ManualInputSection from "./components/ManualInputSection";
import ScanSection from "./components/ScanSection";

enum JoinMode {
  Code = "code",
  QR = "qr",
}

const JoinGameView = () => {
  const dispatch = useAppDispatch();
  const game = useAppSelector((state) => state.games.game);
  const loading = useLoadingSelector(joinGame);
  const { error } = useErrorSelector(joinGame);

  const [joinCode, setJoinCode] = useState("");
  const [joinMode, setJoinMode] = useState<JoinMode>();

  const isScreenXs = useBreakpoint((breakpoints) => breakpoints.only("xs"));

  const handleJoin = useCallback(
    (joinMode: JoinMode, joinCode: string) => {
      setJoinCode(joinCode);
      setJoinMode(joinMode);
      dispatch(joinGame({ joinCode }));
    },
    [dispatch],
  );

  const handleDismissError = () => {
    setJoinCode("");
    setJoinMode(undefined);
    dispatch(dismissError({ typePrefix: joinGame.typePrefix }));
  };

  if (game && game.joinCode === joinCode) {
    return <AppNavigate replace to={`/games/${game.id}`} />;
  }

  return (
    <View
      appBar={{
        title: (
          <FormattedMessage
            id="JoinGameView.title"
            defaultMessage="Join existing game"
          />
        ),
        showBack: true,
        showLogout: true,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        spacing={4}
        sx={{ flexGrow: { xs: 1, sm: 0 }, flexShrink: 0, overflow: "hidden" }}
      >
        <ScanSection
          loading={joinMode === JoinMode.QR && loading}
          error={joinMode === JoinMode.QR ? error : undefined}
          onResult={(joinCode) => handleJoin(JoinMode.QR, joinCode)}
          onDismissError={handleDismissError}
        />

        <Divider
          orientation={isScreenXs ? "horizontal" : "vertical"}
          sx={{ textTransform: "uppercase" }}
        >
          <FormattedMessage id="JoinGameView.divider" defaultMessage="or" />
        </Divider>

        <ManualInputSection
          loading={joinMode === JoinMode.Code && loading}
          error={joinMode === JoinMode.Code ? error : undefined}
          onSubmit={(joinCode) => handleJoin(JoinMode.Code, joinCode)}
        />
      </Stack>
    </View>
  );
};

export default JoinGameView;
