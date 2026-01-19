import { FormattedMessage } from "react-intl";

import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GroupsIcon from "@mui/icons-material/Groups";
import { ChipProps } from "@mui/joy";

import { ResponsiveChip } from "@/components/common/ResponsiveChip";
import { Game, GameState } from "@/types/games";

interface GameStateChipProps extends Omit<
  ChipProps,
  "children" | "startDecorator"
> {
  game: Game;
}

const getIcon = (game: Game): React.ReactNode => {
  switch (game.state) {
    case GameState.WaitingForPlayers:
      return <GroupsIcon />;
    case GameState.Completed:
      return <CheckCircleIcon />;
    case GameState.Aborted:
      return <CancelIcon />;
    default:
      return <AudiotrackIcon />;
  }
};

const getLabel = (game: Game): React.ReactNode => {
  const roundNumber = (game.turns.length % game.players.length) + 1;

  switch (game.state) {
    case GameState.WaitingForPlayers:
      return (
        <FormattedMessage
          id="GameStateChip.waitingForPlayers"
          defaultMessage="Waiting for players"
        />
      );
    case GameState.Completed:
      return (
        <FormattedMessage
          id="GameStateChip.completed"
          defaultMessage="Completed"
        />
      );
    case GameState.Aborted:
      return (
        <FormattedMessage id="GameStateChip.aborted" defaultMessage="Aborted" />
      );
    default:
      return (
        <FormattedMessage
          id="GameStateChip.inProgress"
          defaultMessage="In progress (Round {roundNumber})"
          values={{ roundNumber }}
        />
      );
  }
};

const GameStateChip = ({ game, ...remainingProps }: GameStateChipProps) => (
  <ResponsiveChip {...remainingProps} startDecorator={getIcon(game)}>
    {getLabel(game)}
  </ResponsiveChip>
);

export default GameStateChip;
