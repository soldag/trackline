import { FormattedMessage } from "react-intl";
import { Link } from "react-router";

import { Button, Stack } from "@mui/joy";

import View from "@/components/views/View";

const HomeView = () => (
  <View appBar={{ showTitle: true, showLogout: true }}>
    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems="center"
      justifyContent="center"
      spacing={2}
    >
      <Button fullWidth component={Link} to="/games/new">
        <FormattedMessage
          id="HomeView.createGame"
          defaultMessage="Create new game"
        />
      </Button>

      <Button fullWidth component={Link} to="/games/join">
        <FormattedMessage
          id="HomeView.joinGame"
          defaultMessage="Join existing game"
        />
      </Button>
    </Stack>
  </View>
);

export default HomeView;
