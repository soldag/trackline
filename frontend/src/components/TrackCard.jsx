import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import CardCover from "@mui/joy/CardCover";
import Typography from "@mui/joy/Typography";

import TrackType from "types/track";

const TrackCard = ({ track }) => (
  <Card
    sx={{
      "height": 250,
      "width": 250,
      "textAlign": "center",
      "userSelect": "none",
      "--Card-radius": "5px",
    }}
  >
    <CardCover>
      <img src={track.coverUrl} loading="lazy" alt="" />
    </CardCover>
    <CardCover
      sx={{
        background:
          "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0) 150px), " +
          "linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0) 150px)",
        backgroundColor: "rgba(0,0,0,0.2)",
      }}
    />
    <CardContent sx={{ justifyContent: "flex-start" }}>
      <Typography level="h1" fontSize="xl" textColor="#fff">
        {track.release_year}
      </Typography>
    </CardContent>
    <CardContent sx={{ justifyContent: "flex-end" }}>
      <Typography level="h2" fontSize="md" textColor="#fff">
        {track.title}
      </Typography>
      <Typography fontSize="md" textColor="neutral.300">
        {track.artist}
      </Typography>
    </CardContent>
  </Card>
);

TrackCard.propTypes = {
  track: TrackType.isRequired,
};

export default TrackCard;
