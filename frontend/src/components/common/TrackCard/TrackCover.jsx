import PropTypes from "prop-types";

import { CardCover } from "@mui/joy";

const TrackCover = ({ src }) => (
  <>
    <CardCover>
      <img src={src} alt="" />
    </CardCover>
    <CardCover
      sx={{
        background:
          "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0) 150px), " +
          "linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0) 150px)",
        backgroundColor: "rgba(0,0,0,0.2)",
      }}
    />
  </>
);

TrackCover.propTypes = {
  src: PropTypes.string.isRequired,
};

export default TrackCover;
