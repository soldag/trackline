import PropTypes from "prop-types";

const PlayerType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  points: PropTypes.number.isRequired,
  tokens: PropTypes.number.isRequired,
});

export default PlayerType;
