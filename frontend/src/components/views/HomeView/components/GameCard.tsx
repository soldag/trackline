import Avatar from "boring-avatars";
import { useIntl } from "react-intl";
import { Link } from "react-router";

import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import { Box, Card, CardContent, Stack, Typography } from "@mui/joy";

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
    <Link to={`/games/${game.id}`} style={{ textDecoration: "none" }}>
      <Card
        orientation="horizontal"
        variant="soft"
        color="primary"
        sx={{
          "&:hover": {
            boxShadow: "md",
            backgroundColor: "primary.softHoverBg",
          },
        }}
      >
        <CardContent sx={{ overflow: "hidden" }}>
          <Stack direction="row" spacing={2} alignItems={"center"}>
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
            <Box sx={{ flexShrink: 2, overflow: "hidden" }}>
              <Typography
                level="title-lg"
                sx={{ mb: 1, overflow: "hidden", textOverflow: "ellipsis" }}
              >
                {game.id}
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                sx={{ columnGap: 1, rowGap: 0.5 }}
              >
                <GameStateChip variant="solid" color="primary" game={game} />
                <ResponsiveChip
                  variant="solid"
                  color="primary"
                  startDecorator={<AccessTimeFilledIcon />}
                >
                  {formatRelativeTime(game.creationTime, locale)}
                </ResponsiveChip>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Link>
  );
};

export default GameCard;
