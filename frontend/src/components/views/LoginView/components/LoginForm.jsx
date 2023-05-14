import PropTypes from "prop-types";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";

import KeyIcon from "@mui/icons-material/Key";
import PersonIcon from "@mui/icons-material/Person";
import { Button, Grid, Input } from "@mui/joy";

import ErrorAlert from "components/common/ErrorAlert";
import { MAX_PASSWORD_LENGTH, MAX_USERNAME_LENGTH } from "constants";
import { ErrorType } from "types/errors";

const LoginForm = ({ loading, error, onSubmit, onDismissError }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const isValid = username.length > 0 && password.length > 0;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isValid && onSubmit) {
      setPassword("");
      onSubmit({ username, password });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
            {([label]) => (
              <Input
                variant="soft"
                startDecorator={<PersonIcon />}
                label={label}
                placeholder={label}
                value={username}
                slotProps={{
                  input: {
                    autoCapitalize: "none",
                    maxLength: MAX_USERNAME_LENGTH,
                  },
                }}
                onChange={({ target: { value } }) => setUsername(value)}
              />
            )}
          </FormattedMessage>
        </Grid>

        <Grid xs={12}>
          <FormattedMessage
            id="LoginView.LoginForm.password.label"
            defaultMessage="Password"
          >
            {([label]) => (
              <Input
                type="password"
                variant="soft"
                startDecorator={<KeyIcon />}
                label={label}
                placeholder={label}
                value={password}
                slotProps={{
                  input: { maxLength: MAX_PASSWORD_LENGTH },
                }}
                onChange={({ target: { value } }) => setPassword(value)}
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
            disabled={loading || !isValid}
            onClick={handleSubmit}
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

LoginForm.propTypes = {
  loading: PropTypes.bool,
  error: ErrorType,
  onSubmit: PropTypes.func,
  onDismissError: PropTypes.func,
};

export default LoginForm;
