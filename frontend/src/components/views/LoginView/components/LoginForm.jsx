import PropTypes from "prop-types";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { Link } from "react-router-dom";

import KeyIcon from "@mui/icons-material/Key";
import PersonIcon from "@mui/icons-material/Person";
import { Button, Grid, Input } from "@mui/joy";

import ErrorAlert from "components/common/ErrorAlert";
import FormError from "components/common/FormError";
import {
  MAX_PASSWORD_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
} from "constants";
import { ErrorType } from "types/errors";
import { buildRules } from "utils/forms";

const LoginForm = ({ loading, error, onSubmit, onDismissError }) => {
  const intl = useIntl();
  const {
    control,
    formState: { isValid, errors },
    resetField,
    handleSubmit,
  } = useForm({
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
    <form onSubmit={handleSubmit(onSubmit)}>
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
          <Controller
            name="username"
            control={control}
            rules={buildRules(intl, {
              required: true,
              minLength: MIN_USERNAME_LENGTH,
              maxLength: MAX_USERNAME_LENGTH,
            })}
            render={({ field }) => (
              <FormattedMessage
                id="LoginView.LoginForm.username.placeholder"
                defaultMessage="Username"
              >
                {([label]) => (
                  <Input
                    {...field}
                    autoComplete="username"
                    variant="soft"
                    startDecorator={<PersonIcon />}
                    label={label}
                    placeholder={label}
                    error={!!errors.username}
                    slotProps={{
                      input: {
                        autoCapitalize: "none",
                        maxLength: MAX_USERNAME_LENGTH,
                      },
                    }}
                  />
                )}
              </FormattedMessage>
            )}
          />
          {errors.username && <FormError>{errors.username.message}</FormError>}
        </Grid>

        <Grid xs={12}>
          <Controller
            name="password"
            control={control}
            rules={buildRules(intl, {
              required: true,
              minLength: MIN_PASSWORD_LENGTH,
              maxLength: MAX_PASSWORD_LENGTH,
            })}
            render={({ field }) => (
              <FormattedMessage
                id="LoginView.LoginForm.password.label"
                defaultMessage="Password"
              >
                {([label]) => (
                  <Input
                    {...field}
                    type="password"
                    autoComplete="current-password"
                    variant="soft"
                    startDecorator={<KeyIcon />}
                    label={label}
                    placeholder={label}
                    error={!!errors.password}
                    slotProps={{
                      input: {
                        maxLength: MAX_PASSWORD_LENGTH,
                      },
                    }}
                  />
                )}
              </FormattedMessage>
            )}
          />
          {errors.password && <FormError>{errors.password.message}</FormError>}
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
          <Button fullWidth type="submit" disabled={loading || !isValid}>
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

LoginForm.propTypes = {
  loading: PropTypes.bool,
  error: ErrorType,
  onSubmit: PropTypes.func,
  onDismissError: PropTypes.func,
};

export default LoginForm;
