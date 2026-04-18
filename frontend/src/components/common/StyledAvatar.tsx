import Avatar from "boring-avatars";

type StyledAvatarProps = Omit<React.ComponentProps<typeof Avatar>, "colors">;

const StyledAvatar = (props: StyledAvatarProps) => (
  <Avatar
    {...props}
    colors={["#0b6bcb", "#5e68c5", "#8365bc", "#9c63b1", "#bc6699", "#ff9a77"]}
  />
);

export default StyledAvatar;
