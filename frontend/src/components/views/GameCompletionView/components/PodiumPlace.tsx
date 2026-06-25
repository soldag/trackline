import { keyframes } from "@emotion/react";

import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Box, Stack, Typography } from "@mui/joy";

import ScoringResult from "@/components/common/ScoringResult";
import UserAvatar from "@/components/common/UserAvatar";
import { getRankStyle } from "@/style/rankStyles";
import { RankedPlayer } from "@/types/games";
import { getPlayerScore } from "@/utils/games";
import { useBreakpoint } from "@/utils/hooks";

interface AvatarAnimation {
  keyframes: ReturnType<typeof keyframes>;
  duration: number;
  delay: number;
}

const WINNER_AVATAR_SIZE_XS = 64;
const WINNER_AVATAR_SIZE_SM = 80;

const OTHER_AVATAR_SIZE_XS = 48;
const OTHER_AVATAR_SIZE_SM = 60;

const MIN_PEDESTAL_HEIGHT_XS = 36;
const MIN_PEDESTAL_HEIGHT_SM = 48;

const MAX_PEDESTAL_HEIGHT_XS = 80;
const MAX_PEDESTAL_HEIGHT_SM = 100;

// 93 BPM → 60/93 s per beat, four beats per dance cycle.
const DANCE_BPM = 93;
const BEAT_DURATION = 60 / DANCE_BPM;
const DANCE_DURATION = 4 * BEAT_DURATION;

const TROPHY_KEYFRAMES = keyframes`
  0%   { transform: rotate(14deg) translateY(0); }
  50%  { transform: rotate(18deg) translateY(-2px); }
  100% { transform: rotate(14deg) translateY(0); }
`;

const AVATAR_ANIMATIONS: Partial<Record<number, AvatarAnimation>> = {
  1: {
    keyframes: keyframes`
      0%     { transform: translateY(0) rotate(-7deg) scale(1); }
      12.5%  { transform: translateY(-8px) rotate(-4deg) scale(1.03); }
      25%    { transform: translateY(0) rotate(6deg) scale(1); }
      37.5%  { transform: translateY(-5px) rotate(8deg) scale(1.02); }
      50%    { transform: translateY(0) rotate(3deg) scale(1); }
      62.5%  { transform: translateY(-8px) rotate(-2deg) scale(1.03); }
      75%    { transform: translateY(0) rotate(-8deg) scale(1); }
      87.5%  { transform: translateY(-5px) rotate(-4deg) scale(1.02); }
      100%   { transform: translateY(0) rotate(-7deg) scale(1); }
    `,
    duration: DANCE_DURATION,
    delay: 0,
  },
  2: {
    keyframes: keyframes`
      0%   { transform: translateY(0) rotate(-1.5deg) scale(1); }
      25%  { transform: translateY(-4px) rotate(3deg) scale(1.01); }
      50%  { transform: translateY(0) rotate(-1.5deg) scale(1); }
      75%  { transform: translateY(-3px) rotate(2.5deg) scale(1.008); }
      100% { transform: translateY(0) rotate(-1.5deg) scale(1); }
    `,
    duration: 2 * BEAT_DURATION,
    delay: 0,
  },
  3: {
    keyframes: keyframes`
      0%      { transform: translateY(0) rotate(1.5deg) scale(1); }
      16.66%  { transform: translateY(-4px) rotate(-3deg) scale(1.01); }
      33.33%  { transform: translateY(0) rotate(1.5deg) scale(1); }
      50%     { transform: translateY(-3px) rotate(-2.5deg) scale(1.008); }
      66.66%  { transform: translateY(0) rotate(1.5deg) scale(1); }
      83.33%  { transform: translateY(-3px) rotate(-3deg) scale(1.008); }
      100%    { transform: translateY(0) rotate(1.5deg) scale(1); }
    `,
    duration: 3 * BEAT_DURATION,
    delay: -1 * BEAT_DURATION,
  },
};

interface PodiumPlaceProps {
  player: RankedPlayer;
  username: string;
  topScore: number;
}

const PodiumPlace = ({ player, username, topScore }: PodiumPlaceProps) => {
  const style = getRankStyle(player.rank);
  const isScreenXs = useBreakpoint((breakpoints) => breakpoints.only("xs"));

  const isWinner = player.rank === 1;
  const avatarAnimation = AVATAR_ANIMATIONS[player.rank];

  const winnerAvatarSize = isScreenXs
    ? WINNER_AVATAR_SIZE_XS
    : WINNER_AVATAR_SIZE_SM;
  const otherAvatarSize = isScreenXs
    ? OTHER_AVATAR_SIZE_XS
    : OTHER_AVATAR_SIZE_SM;
  const avatarSize = isWinner ? winnerAvatarSize : otherAvatarSize;

  const minPedestalHeight = isScreenXs
    ? MIN_PEDESTAL_HEIGHT_XS
    : MIN_PEDESTAL_HEIGHT_SM;
  const maxPedestalHeight = isScreenXs
    ? MAX_PEDESTAL_HEIGHT_XS
    : MAX_PEDESTAL_HEIGHT_SM;
  const scoreRatio = topScore > 0 ? getPlayerScore(player) / topScore : 1;
  const pedestalHeight =
    minPedestalHeight + scoreRatio * (maxPedestalHeight - minPedestalHeight);

  return (
    <Stack alignItems="center" justifyContent="flex-end" spacing={1} flex={1}>
      <Stack alignItems="center" spacing={0.5}>
        <Box sx={{ p: 0.5 }}>
          <Box
            sx={{
              position: "relative",
              p: "3px",
              borderRadius: "50%",
              border: "3px solid",
              borderColor: style?.ring,
              boxShadow: style?.shadow,
              lineHeight: 0,
              transformOrigin: "bottom center",
              ...(avatarAnimation && {
                animation: `${avatarAnimation.keyframes} ${avatarAnimation.duration}s ease-in-out ${avatarAnimation.delay}s infinite`,
              }),
            }}
          >
            {isWinner && (
              <EmojiEventsIcon
                sx={{
                  position: "absolute",
                  top: "-8%",
                  right: "-14%",
                  fontSize: avatarSize * 0.6,
                  color: style?.ring,
                  filter: "drop-shadow(0 2px 3px rgba(0, 0, 0, 0.25))",
                  transformOrigin: "bottom center",
                  animation: `${TROPHY_KEYFRAMES} ${BEAT_DURATION}s ease-in-out infinite`,
                }}
              />
            )}

            <UserAvatar username={username} size={avatarSize} />
          </Box>
        </Box>

        <Typography
          level={isWinner ? "title-md" : "title-sm"}
          fontWeight="lg"
          sx={{
            color: isWinner ? style?.ring : "text.tertiary",
          }}
        >
          {username}
        </Typography>

        <ScoringResult tracks={player.timeline.length} tokens={player.tokens} />
      </Stack>

      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{
          width: "100%",
          height: pedestalHeight,
          borderRadius: "sm",
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          background: style?.background,
        }}
      >
        <Typography
          sx={{
            color: style?.color,
            fontSize: isWinner ? "2.5rem" : "1.75rem",
            fontWeight: "xl",
          }}
        >
          {player.rank}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default PodiumPlace;
