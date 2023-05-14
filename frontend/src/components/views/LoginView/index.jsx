import { FormattedMessage } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

import { Box, Stack, Typography } from "@mui/joy";

import Heading from "components/common/Heading";
import View from "components/views/View";
import { login } from "store/auth/actions";
import { dismissError } from "store/common/actions";

import LoginForm from "./components/LoginForm";

const LoginView = () => {
  const location = useLocation();

  const dispatch = useDispatch();
  const loading = useSelector((state) => state.auth.loading);
  const error = useSelector((state) => state.auth.error);
  const user = useSelector((state) => state.auth.user);

  const handleLogin = ({ username, password }) =>
    dispatch(login({ username, password }));

  const handleDismissError = () => dispatch(dismissError());

  if (user) {
    const path = location.state?.redirect || "/";
    return <Navigate replace to={path} />;
  }

  return (
    <View>
      <Stack direction="column" spacing={2}>
        <Box sx={{ flexGrow: 4 }} />

        <Heading />

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="column" spacing={2}>
          <Typography level="h3" fontSize="xl2" fontWeight="lg">
            <FormattedMessage id="LoginView.header" defaultMessage="Login" />
          </Typography>

          <LoginForm
            loading={loading}
            error={error}
            onSubmit={handleLogin}
            onDismissError={handleDismissError}
          />
        </Stack>

        <Box sx={{ flexGrow: 4 }} />
      </Stack>
    </View>
  );
};

export default LoginView;
