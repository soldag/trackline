import Avatar from "boring-avatars";
import { useIntl } from "react-intl";

import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import { Stack } from "@mui/joy";

import ActionCard from "@/components/common/ActionCard";
import GameStateChip from "@/components/common/GameStateChip";
import { ResponsiveChip } from "@/components/common/ResponsiveChip";
import { Game } from "@/types/games";
import { formatRelativeTime } from "@/utils/i18n";

interface GameCardProps {
  game: Game;
}

const GameCard = ({ game }: GameCardProps) => {
  const { locale } = useIntl();

  return (
    <ActionCard
      variant="soft"
      color="primary"
      title={game.id}
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
            {formatRelativeTime(game.creationTime, locale)}
          </ResponsiveChip>
        </Stack>
      }
      startDecorator={
        <Avatar
          size={50}
          variant="marble"
          colors={[
            "#0b6bcb",
            "#5e68c5",
            "#8365bc",
            "#9c63b1",
            "#bc6699",
            "#ff9a77",
          ]}
          name={game.id}
        />
      }
      linkTo={`/games/${game.id}`}
    />
  );
};

export default GameCard;
