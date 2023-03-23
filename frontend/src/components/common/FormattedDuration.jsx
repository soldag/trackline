import PropTypes from "prop-types";

const pad = (value) => String(value).padStart(2, "0");

const FormattedDuration = ({ ms }) => {
  if (ms == null) {
    return "--:--";
  }

  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${pad(minutes)}:${pad(seconds)}`;
};

FormattedDuration.propTypes = {
  ms: PropTypes.number,
};

export default FormattedDuration;
