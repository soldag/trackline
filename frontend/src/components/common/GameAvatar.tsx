import StyledAvatar from "@/components/common/StyledAvatar";

interface GameAvatarProps extends Omit<
  React.ComponentProps<typeof StyledAvatar>,
  "name" | "variant"
> {
  gameId: string;
}

const GameAvatar = ({ gameId, ...remainingProps }: GameAvatarProps) => (
  <StyledAvatar {...remainingProps} name={gameId} variant="marble" />
);

export default GameAvatar;
