import PropTypes from "prop-types";

export const ErrorType = PropTypes.shape({
  code: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
});
