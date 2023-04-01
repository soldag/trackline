import PropTypes from "prop-types";
import { useState } from "react";
import { FormattedMessage } from "react-intl";

import ClearIcon from "@mui/icons-material/Clear";
import NumbersIcon from "@mui/icons-material/Numbers";
import { Button, Grid, IconButton, Input } from "@mui/joy";

import { GAME_ID_LENGTH, GAME_ID_REGEX } from "constants";

const JoinGameForm = ({ onSubmit }) => {
  const [gameId, setGameId] = useState("");

  const isValid = !!gameId.match(GAME_ID_REGEX);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isValid && onSubmit) {
      onSubmit({ gameId });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid xs={12}>
          <FormattedMessage
            id="JoinGameView.JoinGameForm.gameId.label"
            defaultMessage="Game ID"
          >
            {([label]) => (
              <Input
                label={label}
                placeholder={label}
                value={gameId}
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
                onChange={({ target: { value } }) => setGameId(value)}
              />
            )}
          </FormattedMessage>
        </Grid>
        <Grid xs={12}>
          <Button
            fullWidth
            type="submit"
            disabled={!isValid}
            onClick={handleSubmit}
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

JoinGameForm.propTypes = {
  onSubmit: PropTypes.func,
};

export default JoinGameForm;
