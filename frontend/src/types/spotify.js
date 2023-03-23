import PropTypes from "prop-types";

export const ImageType = PropTypes.shape({
  url: PropTypes.string.isRequired,
  height: PropTypes.number,
  width: PropTypes.number,
});

const PlaylistType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  images: PropTypes.arrayOf(ImageType).isRequired,
  owner: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
  }),
  tracks: PropTypes.shape({
    total: PropTypes.number.isRequired,
  }).isRequired,
});

export default PlaylistType;
