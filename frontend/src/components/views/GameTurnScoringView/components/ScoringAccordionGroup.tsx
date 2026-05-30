import { useState } from "react";
import { FormattedMessage } from "react-intl";

import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import LyricsIcon from "@mui/icons-material/Lyrics";
import WebStoriesIcon from "@mui/icons-material/WebStories";
import { AccordionGroup, Typography } from "@mui/joy";

import YearRange from "@/components/common/YearRange";
import { Player, ReleaseYearGuess, Turn } from "@/types/games";
import { User } from "@/types/users";
import { getYearRangeOfGuess } from "@/utils/games";

import ScoringAccordion from "./ScoringAccordion";

enum ScoringCategory {
  Position = "position",
  Year = "year",
  Credits = "credits",
}

interface SummaryProps {
  turn: Turn;
  users: User[];
}

const PositionSummary = ({ turn, users }: SummaryProps) => {
  const winnerId = turn.scoring.releaseYear.position.winner;
  if (winnerId) {
    const username = users.find((u) => u.id === winnerId)?.username;
    return (
      <FormattedMessage
        id="GameTurnScoringView.ScoringAccordionGroup.position.summary.winner"
        defaultMessage="{username} placed the track right."
        values={{
          username: (
            <Typography textColor="success.plainColor">{username}</Typography>
          ),
        }}
      />
    );
  }

  return (
    <FormattedMessage
      id="GameTurnScoringView.ScoringAccordionGroup.position.summary.noWinner"
      defaultMessage="No one placed it right."
    />
  );
};

const YearSummary = ({ turn, users }: SummaryProps) => {
  const winnerId = turn.scoring.releaseYear.year.winner;
  if (winnerId) {
    const username = users.find((u) => u.id === winnerId)?.username;
    return (
      <FormattedMessage
        id="GameTurnScoringView.ScoringAccordionGroup.year.summary.winner"
        defaultMessage="{username} got the exact year."
        values={{
          username: (
            <Typography textColor="success.plainColor">{username}</Typography>
          ),
        }}
      />
    );
  }

  return (
    <FormattedMessage
      id="GameTurnScoringView.ScoringAccordionGroup.year.summary.noWinner"
      defaultMessage="No one guessed the year."
    />
  );
};

const CreditsSummary = ({ turn, users }: SummaryProps) => {
  const winnerId = turn.scoring.credits.winner;
  if (winnerId) {
    const username = users.find((u) => u.id === winnerId)?.username;
    return (
      <FormattedMessage
        id="GameTurnScoringView.ScoringAccordionGroup.credits.summary.winner"
        defaultMessage="{username} named the track."
        values={{
          username: (
            <Typography textColor="success.plainColor">{username}</Typography>
          ),
        }}
      />
    );
  }

  return (
    <FormattedMessage
      id="GameTurnScoringView.ScoringAccordionGroup.credits.summary.noWinner"
      defaultMessage="No one named the track."
    />
  );
};

interface ScoringAccordionGroupProps {
  turn: Turn;
  players: Player[];
  users: User[];
}

const ScoringAccordionGroup = ({
  turn,
  players,
  users,
}: ScoringAccordionGroupProps) => {
  const [openAccordion, setOpenAccordion] = useState<ScoringCategory | null>(
    null,
  );

  const positionScoringWinner = turn.scoring.releaseYear.position.winner;
  const tracksDeltas = positionScoringWinner
    ? { [positionScoringWinner]: 1 }
    : {};

  const handleToggle = (value: ScoringCategory) =>
    setOpenAccordion((prev) => (prev === value ? null : value));

  const renderPositionGuess = (guess: ReleaseYearGuess) => {
    const timeline = players.find(
      (p) => p.userId === turn.activeUserId,
    )?.timeline;
    const { min, max } = getYearRangeOfGuess(timeline ?? [], guess);

    return <YearRange min={min} max={max} />;
  };

  return (
    <AccordionGroup sx={{ gap: 1 }}>
      <ScoringAccordion
        open={openAccordion === ScoringCategory.Position}
        onToggle={() => handleToggle(ScoringCategory.Position)}
        icon={<WebStoriesIcon />}
        label={
          <FormattedMessage
            id="GameTurnScoringView.ScoringAccordionGroup.position.label"
            defaultMessage="Timeline"
          />
        }
        summary={<PositionSummary turn={turn} users={users} />}
        users={users}
        activeUserId={turn.activeUserId}
        guesses={turn.guesses.releaseYear}
        scoring={turn.scoring.releaseYear.position}
        renderGuessContent={renderPositionGuess}
        tracksDeltas={tracksDeltas}
      />

      <ScoringAccordion
        hideTokenCost
        open={openAccordion === ScoringCategory.Year}
        onToggle={() => handleToggle(ScoringCategory.Year)}
        icon={<EventAvailableIcon />}
        label={
          <FormattedMessage
            id="GameTurnScoringView.ScoringAccordionGroup.year.label"
            defaultMessage="Release year"
          />
        }
        summary={<YearSummary turn={turn} users={users} />}
        users={users}
        activeUserId={turn.activeUserId}
        guesses={turn.guesses.releaseYear}
        scoring={turn.scoring.releaseYear.year}
        renderGuessContent={(g) => g.year}
      />

      <ScoringAccordion
        open={openAccordion === ScoringCategory.Credits}
        onToggle={() => handleToggle(ScoringCategory.Credits)}
        icon={<LyricsIcon />}
        label={
          <FormattedMessage
            id="GameTurnScoringView.ScoringAccordionGroup.credits.label"
            defaultMessage="Artists & title"
          />
        }
        summary={<CreditsSummary turn={turn} users={users} />}
        users={users}
        activeUserId={turn.activeUserId}
        guesses={turn.guesses.credits}
        scoring={turn.scoring.credits}
        renderGuessContent={(g) => `${g.artists.join(", ")} · ${g.title}`}
      />
    </AccordionGroup>
  );
};

export default ScoringAccordionGroup;
