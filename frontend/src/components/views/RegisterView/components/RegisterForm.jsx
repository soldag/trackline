import PropTypes from "prop-types";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";

import KeyIcon from "@mui/icons-material/Key";
import PersonIcon from "@mui/icons-material/Person";
import { Button, Grid, Input } from "@mui/joy";

import {
  MAX_PASSWORD_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
} from "constants";

const validateUsername = (value) =>
  value.length >= MIN_USERNAME_LENGTH && value.length <= MAX_USERNAME_LENGTH;

const validatePassword = (value) =>
  value.length >= MIN_PASSWORD_LENGTH && value.length <= MAX_PASSWORD_LENGTH;

const RegisterForm = ({ onSubmit }) => {
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const isValid = validateUsername(username) && validatePassword(password);

  const handleUsernameChange = ({ target: { value } }) => {
    setUsername(value);
    if (validateUsername(value)) {
      setUsernameError(false);
    }
  };

  const handleUsernameBlur = () => {
    if (!validateUsername(username)) {
      setUsernameError(true);
    }
  };

  const handlePasswordChange = ({ target: { value } }) => {
    setPassword(value);
    if (validatePassword(value)) {
      setPasswordError(false);
    }
  };

  const handlePasswordBlur = () => {
    if (!validatePassword(password)) {
      setPasswordError(true);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isValid && onSubmit) {
      onSubmit({ username, password });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid xs={12}>
          <FormattedMessage
            id="RegisterView.RegisterForm.username.placeholder"
            defaultMessage="Username"
          >
            {([label]) => (
              <Input
                variant="soft"
                startDecorator={<PersonIcon />}
                label={label}
                placeholder={label}
                error={usernameError}
                value={username}
                slotProps={{
                  input: {
                    autoCapitalize: "none",
                    maxLength: MAX_USERNAME_LENGTH,
                  },
                }}
                onChange={handleUsernameChange}
                onBlur={handleUsernameBlur}
              />
            )}
          </FormattedMessage>
        </Grid>

        <Grid xs={12}>
          <FormattedMessage
            id="RegisterView.RegisterForm.password.label"
            defaultMessage="Password"
          >
            {([label]) => (
              <Input
                type="password"
                variant="soft"
                startDecorator={<KeyIcon />}
                label={label}
                placeholder={label}
                error={passwordError}
                value={password}
                slotProps={{
                  input: { maxLength: MAX_PASSWORD_LENGTH },
                }}
                onChange={handlePasswordChange}
                onBlur={handlePasswordBlur}
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
            to="/login"
          >
            <FormattedMessage
              id="RegisterView.RegisterForm.cancel"
              defaultMessage="Cancel"
            />
          </Button>
        </Grid>
        <Grid xs={6}>
          <Button
            fullWidth
            type="submit"
            disabled={!isValid}
            onClick={handleSubmit}
          >
            <FormattedMessage
              id="RegisterView.RegisterForm.login"
              defaultMessage="Register"
            />
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

RegisterForm.propTypes = {
  onSubmit: PropTypes.func,
};

export default RegisterForm;
