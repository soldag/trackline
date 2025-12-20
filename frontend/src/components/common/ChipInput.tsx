import { forwardRef, useState } from "react";

import { Autocomplete, AutocompleteProps } from "@mui/joy";

interface ChipInputProps<DisableClearable extends boolean> extends Omit<
  AutocompleteProps<string, true, DisableClearable, true>,
  | "freeSolo"
  | "inputValue"
  | "multiple"
  | "onChange"
  | "onInputChange"
  | "options"
  | "slotProps"
> {
  onChange: (value: string[]) => void;
}

const ChipInput = forwardRef<HTMLInputElement, ChipInputProps<boolean>>(
  // eslint-disable-next-line @typescript-eslint/naming-convention
  function ChipInput(
    { placeholder, value, onChange, onBlur, ...remainingProps },
    ref,
  ) {
    const [inputValue, setInputValue] = useState("");

    const handleInputChange = (newInputValue: string) => {
      if (newInputValue.endsWith(",")) {
        onChange([...(value ?? []), newInputValue.slice(0, -1)]);
        setInputValue("");
        return;
      }

      setInputValue(newInputValue);
    };

    const handleBlur: React.FocusEventHandler<HTMLDivElement> = (e) => {
      if (inputValue && value != null && !value.includes(inputValue)) {
        onChange([...value, inputValue]);
      }
      setInputValue("");
      onBlur?.(e);
    };

    return (
      <Autocomplete
        {...remainingProps}
        freeSolo
        multiple
        options={[]}
        slotProps={{ input: { ref } }}
        placeholder={value?.length === 0 ? placeholder : ""}
        value={value}
        inputValue={inputValue}
        onChange={(_, value) => onChange(value)}
        onInputChange={(_, value) => handleInputChange(value)}
        onBlur={handleBlur}
      />
    );
  },
);

export default ChipInput;
