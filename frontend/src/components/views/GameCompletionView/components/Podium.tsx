import { Stack } from "@mui/joy";

import { Player } from "@/types/games";
import { User } from "@/types/users";
import { getPlayerScore, sortPlayersByRank } from "@/utils/games";

import PodiumPlace from "./PodiumPlace";

const VISUAL_ORDERS: Record<number, number[]> = {
  1: [0],
  2: [0, 1],
  3: [1, 0, 2],
};

interface PodiumProps {
  players: Player[];
  users: User[];
}

const Podium = ({ players, users }: PodiumProps) => {
  const rankedPlayers = sortPlayersByRank(players);
  const podiumPlayers = VISUAL_ORDERS[Math.min(rankedPlayers.length, 3)].map(
    (index) => rankedPlayers[index],
  );
  const topScore = getPlayerScore(rankedPlayers[0]);

  return (
    <Stack
      direction="row"
      alignItems="flex-end"
      justifyContent="center"
      spacing={{ xs: 1, sm: 2 }}
    >
      {podiumPlayers.map((player) => (
        <PodiumPlace
          key={player.userId}
          player={player}
          username={users.find((u) => u.id === player.userId)?.username ?? ""}
          topScore={topScore}
        />
      ))}
    </Stack>
  );
};

export default Podium;
