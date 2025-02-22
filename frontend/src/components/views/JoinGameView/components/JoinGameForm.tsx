import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { Link } from "react-router";

import ClearIcon from "@mui/icons-material/Clear";
import NumbersIcon from "@mui/icons-material/Numbers";
import { Button, Grid, IconButton, Input, Stack } from "@mui/joy";

import FormController from "@/components/common/FormController";
import { GAME_ID_LENGTH, GAME_ID_REGEX } from "@/constants";
import { buildRules } from "@/utils/forms";

export interface FormValues {
  gameId: string;
}

interface JoinGameFormProps {
  loading?: boolean;
  onSubmit?: (values: FormValues) => void;
}

const JoinGameForm = ({ loading = false, onSubmit }: JoinGameFormProps) => {
  const intl = useIntl();
  const {
    control,
    formState: { isValid, errors },
    handleSubmit,
  } = useForm<FormValues>({
    mode: "onTouched",
    defaultValues: {
      gameId: "",
    },
  });

  const [gameId, setGameId] = useState("");

  return (
    <form onSubmit={onSubmit ? handleSubmit(onSubmit) : undefined}>
      <Grid container spacing={2}>
        <Grid xs={12}>
          <FormattedMessage
            id="JoinGameView.JoinGameForm.gameId.label"
            defaultMessage="Game ID"
          >
            {([label]) => (
              <FormController
                name="gameId"
                label={label as string}
                control={control}
                rules={buildRules(intl, {
                  required: true,
                  pattern: GAME_ID_REGEX,
                })}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder={label as string}
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
                        <IconButton onClick={() => setGameId("")}>
                          <ClearIcon />
                        </IconButton>
                      )
                    }
                  />
                )}
              />
            )}
          </FormattedMessage>
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
              type="submit"
              loading={loading}
              disabled={loading || !isValid}
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

export default JoinGameForm;
