import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { Link } from "react-router";

import KeyIcon from "@mui/icons-material/Key";
import PersonIcon from "@mui/icons-material/Person";
import { Button, Grid, Input } from "@mui/joy";

import ErrorAlert from "@/components/common/ErrorAlert";
import FormController from "@/components/common/FormController";
import {
  MAX_PASSWORD_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
} from "@/constants";
import { AppError } from "@/types/errors";
import { buildRules } from "@/utils/forms";

export interface FormValues {
  username: string;
  password: string;
}

interface LoginFormProps {
  loading?: boolean;
  error?: AppError;
  onSubmit?: (values: FormValues) => void;
  onDismissError?: () => void;
}

const LoginForm = ({
  loading,
  error,
  onSubmit,
  onDismissError,
}: LoginFormProps) => {
  const intl = useIntl();
  const {
    control,
    formState: { isValid, errors },
    resetField,
    handleSubmit,
  } = useForm<FormValues>({
    mode: "onTouched",
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (error) {
      resetField("password");
    }
  }, [resetField, error]);

  return (
    <form onSubmit={onSubmit ? handleSubmit(onSubmit) : undefined}>
      <Grid container spacing={2}>
        {error && (
          <Grid xs={12}>
            <ErrorAlert
              header={
                <FormattedMessage
                  id="LoginView.LoginForm.error.header"
                  defaultMessage="Login failed"
                />
              }
              error={error}
              onDismiss={onDismissError}
            />
          </Grid>
        )}
        <Grid xs={12}>
          <FormattedMessage
            id="LoginView.LoginForm.username.placeholder"
            defaultMessage="Username"
          >
            {([placeholder]) => (
              <FormController
                name="username"
                control={control}
                rules={buildRules(intl, {
                  required: true,
                  minLength: MIN_USERNAME_LENGTH,
                  maxLength: MAX_USERNAME_LENGTH,
                })}
                render={({ field }) => (
                  <Input
                    {...field}
                    autoComplete="username"
                    variant="soft"
                    startDecorator={<PersonIcon />}
                    placeholder={placeholder as string}
                    error={!!errors.username}
                    slotProps={{
                      input: {
                        autoCapitalize: "none",
                        maxLength: MAX_USERNAME_LENGTH,
                      },
                    }}
                  />
                )}
              />
            )}
          </FormattedMessage>
        </Grid>

        <Grid xs={12}>
          <FormattedMessage
            id="LoginView.LoginForm.password.label"
            defaultMessage="Password"
          >
            {([placeholder]) => (
              <FormController
                name="password"
                control={control}
                rules={buildRules(intl, {
                  required: true,
                  minLength: MIN_PASSWORD_LENGTH,
                  maxLength: MAX_PASSWORD_LENGTH,
                })}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="password"
                    autoComplete="current-password"
                    variant="soft"
                    startDecorator={<KeyIcon />}
                    placeholder={placeholder as string}
                    error={!!errors.password}
                    slotProps={{
                      input: {
                        maxLength: MAX_PASSWORD_LENGTH,
                      },
                    }}
                  />
                )}
              />
            )}
          </FormattedMessage>
        </Grid>

        <Grid xs={6}>
          <Button
            fullWidth
            color="neutral"
            variant="soft"
            component={Link}
            to="/register"
            onClick={onDismissError}
          >
            <FormattedMessage
              id="LoginView.LoginForm.register"
              defaultMessage="Register"
            />
          </Button>
        </Grid>
        <Grid xs={6}>
          <Button
            fullWidth
            type="submit"
            loading={loading}
            disabled={loading || !isValid}
          >
            <FormattedMessage
              id="LoginView.LoginForm.login"
              defaultMessage="Login"
            />
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default LoginForm;
