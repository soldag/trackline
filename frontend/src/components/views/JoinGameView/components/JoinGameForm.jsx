import PropTypes from "prop-types";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { Link } from "react-router-dom";

import ClearIcon from "@mui/icons-material/Clear";
import NumbersIcon from "@mui/icons-material/Numbers";
import { Button, Grid, IconButton, Input, Stack } from "@mui/joy";

import FormError from "components/common/FormError";
import { GAME_ID_LENGTH, GAME_ID_REGEX } from "constants";
import { buildRules } from "utils/forms";

const JoinGameForm = ({ loading = false, onSubmit }) => {
  const intl = useIntl();
  const {
    control,
    formState: { isValid, errors },
    handleSubmit,
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      gameId: "",
    },
  });

  const [gameId, setGameId] = useState("");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid xs={12}>
          <Controller
            name="gameId"
            control={control}
            rules={buildRules(intl, {
              required: true,
              pattern: GAME_ID_REGEX,
            })}
            render={({ field }) => (
              <FormattedMessage
                id="JoinGameView.JoinGameForm.gameId.label"
                defaultMessage="Game ID"
              >
                {([label]) => (
                  <Input
                    {...field}
                    label={label}
                    placeholder={label}
                    error={!!errors.gameId}
                    slotProps={{
                      input: {
                        autoCapitalize: "none",
                        maxLength: GAME_ID_LENGTH,
                      },
                    }}
                    startDecorator={<NumbersIcon />}
                    endDecorator={
                      gameId.length > 0 && (
                        <IconButton
                          variant="plain"
                          color="neutral"
                          onClick={() => setGameId("")}
                        >
                          <ClearIcon />
                        </IconButton>
                      )
                    }
                  />
                )}
              </FormattedMessage>
            )}
          />
          {errors.gameId && <FormError>{errors.gameId.message}</FormError>}
        </Grid>
        <Grid xs={12}>
          <Stack direction="row" spacing={2}>
            <Button
              fullWidth
              color="neutral"
              variant="soft"
              component={Link}
              to="/"
            >
              <FormattedMessage
                id="JoinGameView.JoinGameForm.back"
                defaultMessage="Back"
              />
            </Button>
            <Button
              fullWidth
              loading={loading}
              disabled={loading || !isValid}
              onClick={handleSubmit}
            >
              <FormattedMessage
                id="JoinGameView.JoinGameForm.joinGame"
                defaultMessage="Join game"
              />
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </form>
  );
};

JoinGameForm.propTypes = {
  loading: PropTypes.bool,
  onSubmit: PropTypes.func,
};

export default JoinGameForm;
