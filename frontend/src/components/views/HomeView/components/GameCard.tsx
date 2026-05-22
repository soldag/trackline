import { useState } from "react";
import { useIntl } from "react-intl";

import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import { Stack } from "@mui/joy";

import ActionCard from "@/components/common/ActionCard";
import GameAvatar from "@/components/common/GameAvatar";
import GameStateChip from "@/components/common/GameStateChip";
import { ResponsiveChip } from "@/components/common/ResponsiveChip";
import { Game } from "@/types/games";
import { useInterval } from "@/utils/hooks";
import { formatRelativeTime } from "@/utils/i18n";

interface GameCardProps {
  game: Game;
}

const GameCard = ({ game }: GameCardProps) => {
  const { locale } = useIntl();

  const [relativeTime, setRelativeTime] = useState(
    formatRelativeTime(game.creationTime, locale),
  );

  useInterval(() => {
    setRelativeTime(formatRelativeTime(game.creationTime, locale));
  }, 1000);

  return (
    <ActionCard
      variant="soft"
      color="primary"
      title={game.joinCode}
      description={
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            rowGap: 0.5,
            columnGap: 1,
            overflow: "hidden",
          }}
        >
          <GameStateChip
            variant="solid"
            color="primary"
            game={game}
            sx={{ pointerEvents: "none" }}
          />
          <ResponsiveChip
            variant="solid"
            color="primary"
            startDecorator={<AccessTimeFilledIcon />}
          >
            {relativeTime}
          </ResponsiveChip>
        </Stack>
      }
      startDecorator={<GameAvatar gameId={game.id} size={50} />}
      linkTo={`/games/${game.id}`}
    />
  );
};

export default GameCard;
