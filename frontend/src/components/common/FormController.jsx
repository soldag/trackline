import PropTypes from "prop-types";
import { Controller } from "react-hook-form";

import ReportIcon from "@mui/icons-material/Report";
import { FormControl, FormHelperText, FormLabel } from "@mui/joy";

const FormController = ({ label, render, ...remainingProps }) => (
  <Controller
    {...remainingProps}
    render={({ field, fieldState }) => (
      <FormControl error={!!fieldState.error}>
        {label && <FormLabel>{label}</FormLabel>}
        {render({ field, fieldState })}
        {fieldState.error && (
          <FormHelperText>
            <ReportIcon sx={{ mr: 1 }} />
            {fieldState.error.message}
          </FormHelperText>
        )}
      </FormControl>
    )}
  />
);

FormController.propTypes = {
  ...Controller.propTypes,
  label: PropTypes.string,
  render: PropTypes.func.isRequired,
};

export default FormController;
