import PropTypes from "prop-types";

import Typography from "@mui/joy/Typography";

import SxType from "types/mui";

const NumericDelta = ({ value, icon, sx }) => {
  if (!value) {
    return null;
  }

  return (
    <Typography
      variant="soft"
      color={value < 0 ? "danger" : "success"}
      sx={{ display: "inline-flex", ...sx }}
      endDecorator={icon}
    >
      {value > 0 && "+"}
      {value}
    </Typography>
  );
};

NumericDelta.propTypes = {
  value: PropTypes.number,
  icon: PropTypes.node,
  sx: SxType,
};

export default NumericDelta;
