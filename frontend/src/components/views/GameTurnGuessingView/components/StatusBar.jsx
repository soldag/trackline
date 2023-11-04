import _ from "lodash";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";

import { Stack, Typography } from "@mui/joy";

import { GameType } from "~/types/games";
import { UserType } from "~/types/users";

const StatusBar = ({ game, users, currentUserId }) => {
  const round = Math.max(
    ...Object.values(_.countBy(game.turns, (t) => t.activeUserId)),
  );

  const turn = game.turns.at(-1);
  const activeUser = users.find((u) => u.id === turn?.activeUserId);
  const isActivePlayer = activeUser != null && activeUser.id === currentUserId;
  const challengeGuessesCount = new Set(
    Object.values(turn?.guesses || {})
      .flat()
      .filter((g) => g.userId !== turn?.activeUserId)
      .map((g) => g.userId),
  ).size;

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{ "alignItems": "flex-end", "& > *": { flex: 1 } }}
    >
      <Stack direction={{ xs: "column", sm: "row" }}>
        <Typography level="body-sm" sx={{ fontWeight: "lg" }}>
          <FormattedMessage
            id="GameTurnGuessingView.StatusBar.round"
            defaultMessage="Round {number}"
            values={{ number: round }}
          />
        </Typography>

        {activeUser && (
          <Typography
            level="body-sm"
            sx={{
              "&::before": {
                content: { sm: "': '" },
                fontWeight: "lg",
              },
            }}
          >
            {isActivePlayer ? (
              <FormattedMessage
                id="GameTurnGuessingView.StatusBar.activeUser.active"
                defaultMessage="It's your turn."
              />
            ) : (
              <FormattedMessage
                id="GameTurnGuessingView.StatusBar.activeUser.passive"
                defaultMessage="It's {username}'s turn."
                values={{ username: activeUser?.username }}
              />
            )}
          </Typography>
        )}
      </Stack>

      {turn && (
        <Typography level="body-sm" sx={{ textAlign: "right" }}>
          {isActivePlayer ? (
            <FormattedMessage
              id="GameTurnGuessingView.StatusBar.challenges.active"
              defaultMessage="{count, plural, =0 {Nobody has} one {{count} player has} other {{count} players have}} challenged you."
              values={{ count: challengeGuessesCount }}
            />
          ) : (
            <FormattedMessage
              id="GameTurnGuessingView.StatusBar.challenges.passive"
              defaultMessage="{count, plural, =0 {Nobody has} one {{count} player has} other {{count} players have}} challenged the active player."
              values={{ count: challengeGuessesCount }}
            />
          )}
        </Typography>
      )}
    </Stack>
  );
};

StatusBar.propTypes = {
  game: GameType.isRequired,
  users: PropTypes.arrayOf(UserType).isRequired,
  currentUserId: PropTypes.string,
};

export default StatusBar;
