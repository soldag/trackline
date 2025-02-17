import PropTypes from "prop-types";

import { Typography } from "@mui/joy";

import SxType from "@/types/mui";

const getColor = (value) => {
  if (value < 0) {
    return "danger";
  } else if (value === 0) {
    return "warning";
  } else {
    return "success";
  }
};

const NumericDelta = ({ color, value, icon, sx }) => {
  return (
    <Typography
      variant="soft"
      color={color ?? getColor(value)}
      sx={{ display: "inline-flex", ...sx }}
      endDecorator={icon}
    >
      {value >= 0 && "+"}
      {value}
    </Typography>
  );
};

NumericDelta.propTypes = {
  color: PropTypes.string,
  value: PropTypes.number,
  icon: PropTypes.node,
  sx: SxType,
};

export default NumericDelta;
