import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";

import ReportIcon from "@mui/icons-material/Report";
import { FormControl, FormHelperText, FormLabel } from "@mui/joy";

interface FormControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends ControllerProps<TFieldValues, TName> {
  label?: string;
}

const FormController = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  label,
  render,
  ...remainingProps
}: FormControllerProps<TFieldValues, TName>) => (
  <Controller
    {...remainingProps}
    render={({ field, fieldState, formState }) => (
      <FormControl error={!!fieldState.error}>
        {label && <FormLabel>{label}</FormLabel>}
        {render({ field, fieldState, formState })}
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

export default FormController;
