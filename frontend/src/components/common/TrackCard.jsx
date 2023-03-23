import PropTypes from "prop-types";

import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import CardCover from "@mui/joy/CardCover";
import Typography from "@mui/joy/Typography";

import { TrackType } from "types/games";
import SxType from "types/mui";

const TrackCard = ({ sx, track, onClick }) => (
  <Card
    sx={{
      ...sx,
      "height": {
        xs: 230,
        md: 300,
        lg: 350,
      },
      "width": {
        xs: 230,
        md: 300,
        lg: 350,
      },
      "flexShrink": 0,
      "textAlign": "center",
      "userSelect": "none",
      "--Card-radius": "5px",
      "boxShadow": "sm",
    }}
    onClick={onClick}
  >
    <CardCover>
      <img src={track.imageUrl} alt="" />
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
        {track.releaseYear}
      </Typography>
    </CardContent>
    <CardContent sx={{ justifyContent: "flex-end" }}>
      <Typography level="h2" fontSize="md" textColor="#fff">
        {track.title}
      </Typography>
      <Typography fontSize="md" textColor="neutral.300">
        {track.artists}
      </Typography>
    </CardContent>
  </Card>
);

TrackCard.propTypes = {
  sx: SxType,
  track: TrackType.isRequired,
  onClick: PropTypes.func,
};

export default TrackCard;
