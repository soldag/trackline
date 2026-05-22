import * as _ from "lodash-es";
import React, { useMemo } from "react";
import { FormattedMessage } from "react-intl";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Stack,
  Typography,
} from "@mui/joy";

import ScoringResult from "@/components/common/ScoringResult";
import UserAvatar from "@/components/common/UserAvatar";
import { Guess, Scoring } from "@/types/games";
import { User } from "@/types/users";

interface ScoringAccordionProps<TGuess extends Guess> {
  open: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  label: React.ReactNode;
  summary: React.ReactNode;
  activeUserId: string;
  users: User[];
  guesses: TGuess[];
  scoring: Scoring;
  renderGuessContent: (guess: TGuess) => React.ReactNode;
  tracksDeltas?: { [userId: string]: number };
}

const ScoringAccordion = <TGuess extends Guess>({
  open,
  onToggle,
  icon,
  label,
  summary,
  users,
  activeUserId,
  guesses,
  scoring,
  renderGuessContent,
  tracksDeltas,
}: ScoringAccordionProps<TGuess>) => {
  const color = scoring.winner === null ? "neutral" : "success";

  const usernames = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u.username])),
    [users],
  );

  const sortedGuesses = useMemo(
    () =>
      _.orderBy(
        guesses,
        [(g) => g.userId === activeUserId, (g) => g.creationTime],
        ["desc", "asc"],
      ),
    [guesses, activeUserId],
  );

  return (
    <Accordion
      expanded={open}
      onChange={onToggle}
      variant="outlined"
      sx={{ borderRadius: "sm" }}
    >
      <AccordionSummary
        slotProps={{
          button: { sx: { p: 1.75, gap: 1.5 } },
        }}
      >
        <Box
          sx={{
            "width": 32,
            "height": 32,
            "borderRadius": "sm",
            "bgcolor": `${color}.softBg`,
            "color": `${color}.softColor`,
            "display": "flex",
            "alignItems": "center",
            "justifyContent": "center",
            "flexShrink": 0,
            "& > svg": {
              color: `${color}.softColor`,
            },
          }}
        >
          {icon}
        </Box>

        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <Typography
            level="body-xs"
            textColor="text.tertiary"
            sx={{ mb: 0.25 }}
          >
            {label}
          </Typography>
          <Typography level="body-sm" fontWeight="lg" textColor="text.primary">
            {summary}
          </Typography>
        </Box>

        {scoring.winner && (
          <ScoringResult
            tracksDelta={tracksDeltas?.[scoring.winner]}
            tokenCost={
              guesses.find((g) => g.userId === scoring.winner)?.tokenCost
            }
            tokenGain={scoring.tokenGains[scoring.winner]}
          />
        )}
      </AccordionSummary>

      <AccordionDetails slotProps={{ content: { sx: { pt: 0 } } }}>
        <Divider orientation="horizontal" />
        <Stack spacing={1.5} sx={{ pt: 1 }}>
          {guesses.length === 0 && (
            <Typography level="body-sm" sx={{ px: 0.5 }}>
              <FormattedMessage
                id="GameTurnScoringView.ScoringAccordion.noGuesses"
                defaultMessage="No one took a guess this turn."
              />
            </Typography>
          )}

          {sortedGuesses.map((guess) => (
            <Stack
              key={guess.userId}
              direction="row"
              alignItems="center"
              spacing={1.5}
            >
              <Box sx={{ display: "flex", px: 0.5, flexShrink: 0 }}>
                <UserAvatar username={usernames[guess.userId]} size={28} />
              </Box>

              <Stack spacing={0.25} sx={{ flexGrow: 1 }}>
                <Typography noWrap level="body-sm" fontWeight="lg">
                  {usernames[guess.userId]}
                </Typography>
                <Typography
                  level="body-xs"
                  textColor={
                    scoring.correctGuesses.includes(guess.userId)
                      ? "success.plainColor"
                      : "danger.plainColor"
                  }
                >
                  {renderGuessContent(guess)}
                </Typography>
              </Stack>

              <ScoringResult
                tracksDelta={tracksDeltas?.[guess.userId]}
                tokenCost={guess.tokenCost}
                tokenGain={scoring.tokenGains[guess.userId]}
              />
            </Stack>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default ScoringAccordion;
