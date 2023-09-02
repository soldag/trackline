import PropTypes from "prop-types";
import { forwardRef, useState } from "react";

import { Autocomplete } from "@mui/joy";

const OVERWRITTEN_PROPS = [
  "freeSolo",
  "multiple",
  "options",
  "value",
  "inputValue",
  "onChange",
  "onInputChange",
  "onBlur",
];

const ChipInput = forwardRef(function ChipInput(
  { placeholder, value, onChange, onBlur, ...remainingProps },
  ref,
) {
  const [inputValue, setInputValue] = useState("");

  const handleBlur = (e) => {
    if (inputValue && !value.includes(inputValue)) {
      onChange([...value, inputValue]);
    }
    setInputValue("");
    onBlur(e);
  };

  return (
    <Autocomplete
      {...remainingProps}
      ref={ref}
      freeSolo
      multiple
      options={[]}
      placeholder={value.length === 0 ? placeholder : ""}
      value={value}
      inputValue={inputValue}
      onChange={(e, value) => onChange(value)}
      onInputChange={(e, value) => setInputValue(value)}
      onBlur={handleBlur}
    />
  );
});

ChipInput.propTypes = {
  ...Object.fromEntries(
    Object.entries(Autocomplete.propTypes).filter(
      ([key]) => !OVERWRITTEN_PROPS.includes(key),
    ),
  ),
  value: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ChipInput;
