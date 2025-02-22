import { PropsWithChildren } from "react";

import { Button, ColorPaletteProp, LinearProgress, Typography } from "@mui/joy";

interface VotingButtonProps {
  canVote?: boolean;
  currentVotes?: number;
  maxVotes?: number;
  color?: ColorPaletteProp;
  icon?: React.ReactNode;
  onClick?: () => void;
}

const VotingButton = ({
  canVote = false,
  currentVotes = 0,
  maxVotes = 0,
  color = "neutral",
  icon,
  onClick,
  children,
}: PropsWithChildren<VotingButtonProps>) =>
  canVote ? (
    <Button
      fullWidth
      color={color}
      variant="soft"
      startDecorator={icon}
      onClick={onClick}
    >
      {children}
    </Button>
  ) : (
    <LinearProgress
      determinate
      variant="soft"
      thickness={36}
      value={(currentVotes / maxVotes) * 100}
      sx={(theme) => ({
        "color": theme.palette[color].softBg,
        "--LinearProgress-radius": theme.vars.radius.sm,
      })}
    >
      <Typography
        level="body-sm"
        color={color}
        fontWeight="lg"
        startDecorator={icon}
        sx={{ mixBlendMode: "multiply" }}
      >
        {children}
        {` (${currentVotes}/${maxVotes})`}
      </Typography>
    </LinearProgress>
  );

export default VotingButton;
