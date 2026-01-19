import { Stack } from "@mui/joy";
import { SxProps } from "@mui/joy/styles/types";

import GameCard from "@/components/views/HomeView/components/GameCard";
import { Game } from "@/types/games";

interface GameListProps {
  games: Game[];
  sx?: SxProps;
}

const GameList = ({ games, sx }: GameListProps) => (
  <Stack gap={1} sx={sx}>
    {games.map((game) => (
      <GameCard key={game.id} game={game} />
    ))}
  </Stack>
);

export default GameList;
