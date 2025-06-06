import { FormattedMessage } from "react-intl";
import { Navigate } from "react-router";

import { Box, Stack, Typography } from "@mui/joy";

import Heading from "@/components/common/Heading";
import View from "@/components/views/View";
import { createUser } from "@/store/auth";
import { dismissAllErrors } from "@/store/errors";
import {
  useAppDispatch,
  useAppSelector,
  useErrorSelector,
  useLoadingSelector,
} from "@/utils/hooks";

import RegisterForm, { FormValues } from "./components/RegisterForm";

const RegisterView = () => {
  const dispatch = useAppDispatch();
  const loading = useLoadingSelector(createUser);
  const { error } = useErrorSelector(createUser);
  const user = useAppSelector((state) => state.auth.user);

  const handleLogin = ({ username, password }: FormValues) =>
    dispatch(createUser({ username, password }));

  const handleDismissError = () => dispatch(dismissAllErrors());

  if (user) {
    return <Navigate replace to="/" />;
  }

  return (
    <View>
      <Stack direction="column" spacing={2}>
        <Box sx={{ flexGrow: 4 }} />

        <Heading sx={{ mb: "8dvh" }} />

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="column" spacing={2}>
          <Typography level="title-lg">
            <FormattedMessage
              id="RegisterView.header"
              defaultMessage="Register"
            />
          </Typography>

          <RegisterForm
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

export default RegisterView;
