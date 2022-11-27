import PropTypes from "prop-types";

const TrackType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  artist: PropTypes.string.isRequired,
  release_year: PropTypes.number.isRequired,
  coverUrl: PropTypes.string.isRequired,
});

export default TrackType;
