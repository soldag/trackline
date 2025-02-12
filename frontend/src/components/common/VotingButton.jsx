import PropTypes from "prop-types";

import { Button, LinearProgress, Typography } from "@mui/joy";

const VotingButton = ({
  canVote,
  currentVotes,
  maxVotes,
  color,
  icon,
  onClick,
  children,
}) =>
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

VotingButton.propTypes = {
  canVote: PropTypes.bool,
  currentVotes: PropTypes.number,
  maxVotes: PropTypes.number,
  color: PropTypes.string,
  icon: PropTypes.node,
  onClick: PropTypes.func,
  children: PropTypes.node,
};

export default VotingButton;
