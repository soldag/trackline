import { FormattedMessage } from "react-intl";
import { Navigate, useLocation } from "react-router";

import { Box, Stack, Typography } from "@mui/joy";

import Heading from "@/components/common/Heading";
import View from "@/components/views/View";
import { login } from "@/store/auth";
import { dismissAllErrors } from "@/store/errors";
import {
  useAppDispatch,
  useAppSelector,
  useErrorSelector,
  useLoadingSelector,
} from "@/utils/hooks";

import LoginForm, { FormValues } from "./components/LoginForm";

const LoginView = () => {
  const location = useLocation();

  const dispatch = useAppDispatch();
  const loading = useLoadingSelector(login);
  const { error } = useErrorSelector(login);
  const user = useAppSelector((state) => state.auth.user);

  const handleLogin = ({ username, password }: FormValues) =>
    dispatch(login({ username, password }));

  const handleDismissError = () => dispatch(dismissAllErrors());

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
          <Typography level="title-lg">
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
