import PropTypes from "prop-types";

const SxType = PropTypes.oneOfType([
  PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
  ),
  PropTypes.func,
  PropTypes.object,
]);

export default SxType;
