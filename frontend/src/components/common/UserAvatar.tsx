import StyledAvatar from "@/components/common/StyledAvatar";

interface UserAvatarProps extends Omit<
  React.ComponentProps<typeof StyledAvatar>,
  "name" | "variant"
> {
  username: string;
}

const UserAvatar = ({ username, ...remainingProps }: UserAvatarProps) => (
  <StyledAvatar {...remainingProps} name={username} variant="beam" />
);

export default UserAvatar;
