import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";

import ClearIcon from "@mui/icons-material/Clear";
import NumbersIcon from "@mui/icons-material/Numbers";
import { Button, Grid, IconButton, Input } from "@mui/joy";

import FormController from "@/components/common/FormController";
import { JOIN_CODE_LENGTH, JOIN_CODE_REGEX } from "@/constants";
import { buildRules } from "@/utils/forms";

export interface FormValues {
  joinCode: string;
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
      joinCode: "",
    },
  });

  const [joinCode, setJoinCode] = useState("");

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
                name="joinCode"
                label={label as string}
                control={control}
                rules={buildRules(intl, {
                  required: true,
                  pattern: JOIN_CODE_REGEX,
                })}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder={label as string}
                    error={!!errors.joinCode}
                    slotProps={{
                      input: {
                        autoCapitalize: "on",
                        maxLength: JOIN_CODE_LENGTH,
                      },
                    }}
                    startDecorator={<NumbersIcon />}
                    endDecorator={
                      joinCode.length > 0 && (
                        <IconButton onClick={() => setJoinCode("")}>
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
        </Grid>
      </Grid>
    </form>
  );
};

export default JoinGameForm;
