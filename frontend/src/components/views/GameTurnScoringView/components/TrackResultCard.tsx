import { Box, Card, Stack, Typography } from "@mui/joy";
import type { SxProps } from "@mui/joy/styles/types";

import { Track } from "@/types/games";
import { mergeSx } from "@/utils/style";

interface TrackResultCardProps {
  sx?: SxProps;
  track: Track;
}

const TrackResultCard = ({ sx, track }: TrackResultCardProps) => (
  <Card
    variant="soft"
    color="primary"
    orientation="horizontal"
    sx={mergeSx(sx, { gap: 2, p: 1 })}
  >
    <Box
      sx={{
        width: { xs: "130px", lg: "145px" },
        height: { xs: "130px", lg: "145px" },
        flexShrink: 0,
        borderRadius: "sm",
        overflow: "hidden",
      }}
    >
      <img
        src={track.imageUrl}
        alt="Track cover"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </Box>

    <Stack justifyContent="space-evenly" sx={{ overflow: "hidden" }}>
      <Typography level="h4">{track.releaseYear}</Typography>
      <Stack spacing={0.5}>
        <Typography
          level="title-md"
          fontWeight="lg"
          sx={{ lineClamp: 2, lineHeight: 1.25 }}
        >
          {track.title}
        </Typography>
        <Typography level="title-md" sx={{ lineClamp: 2, lineHeight: 1.25 }}>
          {track.artists.join(", ")}
        </Typography>
      </Stack>
    </Stack>
  </Card>
);

export default TrackResultCard;
