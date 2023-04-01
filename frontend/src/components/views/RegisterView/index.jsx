import { FormattedMessage } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import { Box, Stack, Typography } from "@mui/joy";

import Heading from "components/common/Heading";
import View from "components/views/View";
import { createUser } from "store/auth/actions";

import LoginForm from "./components/RegisterForm";

const RegisterView = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogin = ({ username, password }) =>
    dispatch(createUser({ username, password }));

  if (user) {
    return <Navigate replace to="/" />;
  }

  return (
    <View>
      <Stack direction="column" spacing={2}>
        <Box sx={{ flexGrow: 4 }} />

        <Heading sx={{ mb: "8vh" }} />

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="column" spacing={2}>
          <Typography level="h3" fontSize="xl2" fontWeight="lg">
            <FormattedMessage
              id="RegisterView.header"
              defaultMessage="Register"
            />
          </Typography>

          <LoginForm onSubmit={handleLogin} />
        </Stack>

        <Box sx={{ flexGrow: 4 }} />
      </Stack>
    </View>
  );
};

export default RegisterView;
