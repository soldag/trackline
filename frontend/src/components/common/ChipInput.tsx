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

    const handleNewItem = (item: string) => {
      const trimmedItem = item.trim();
      if (trimmedItem.length > 0 && !value?.includes(trimmedItem)) {
        onChange([...(value ?? []), trimmedItem]);
      }
    };

    const handleInputChange = (newInputValue: string) => {
      if (newInputValue.endsWith(",")) {
        handleNewItem(newInputValue.slice(0, -1));
        setInputValue("");
        return;
      }

      setInputValue(newInputValue);
    };

    const handleBlur: React.FocusEventHandler<HTMLDivElement> = (e) => {
      handleNewItem(inputValue);
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
