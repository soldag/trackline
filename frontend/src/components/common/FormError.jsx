import PropTypes from "prop-types";

import ReportIcon from "@mui/icons-material/Report";
import { Typography } from "@mui/joy";

const FormError = ({ children }) => (
  <Typography
    color="danger"
    fontSize="sm"
    startDecorator={<ReportIcon />}
    sx={{ px: 1, my: 0.5 }}
  >
    {children}
  </Typography>
);

FormError.propTypes = {
  children: PropTypes.node,
};

export default FormError;
