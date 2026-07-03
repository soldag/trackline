import { useMemo, useRef } from "react";

import { Input, Stack } from "@mui/joy";

import { JOIN_CODE_CHAR_REGEX, JOIN_CODE_LENGTH } from "@/constants";
import { isMobile } from "@/utils/device";
import { useMountEffect } from "@/utils/hooks";

interface JoinCodeInputProps {
  disabled?: boolean;
  error?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
}

const JoinCodeInput = ({
  disabled,
  error,
  value,
  onChange,
  onSubmit,
}: JoinCodeInputProps) => {
  const inputElementsRef = useRef<(HTMLInputElement | null)[]>([]);

  const values = useMemo(
    () => Array.from({ length: JOIN_CODE_LENGTH }, (_, i) => value?.[i] ?? ""),
    [value],
  );

  useMountEffect(() => {
    if (!isMobile()) {
      focusInput(0);
    }
  });

  const focusInput = (index: number) =>
    inputElementsRef.current[index]?.focus();

  const setCharAt = (index: number, char: string) => {
    const newValue = Array.from(
      { length: JOIN_CODE_LENGTH },
      (_, i) => (i === index ? char : values[i]) ?? "",
    );
    onChange?.(newValue.join(""));

    if (char && index < JOIN_CODE_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) =>
    e.target.select();

  const handleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const inputValue = e.target.value.toUpperCase();

    const fullRegex = new RegExp(
      `^${JOIN_CODE_CHAR_REGEX.source}{${inputValue.length}}$`,
    );
    if (!fullRegex.test(inputValue)) {
      return;
    }

    const newValue = values
      .map((char, i) => (i < index ? char : (inputValue[i - index] ?? char)))
      .join("");
    onChange?.(newValue);

    focusInput(Math.min(JOIN_CODE_LENGTH - 1, index + inputValue.length));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      if (values[index]) {
        setCharAt(index, "");
      } else if (index > 0) {
        setCharAt(index - 1, "");
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft") {
      if (index > 0) {
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowRight") {
      if (value && index < value.length - 1) {
        focusInput(index + 1);
      }
    } else if (e.key === "Enter") {
      if (value?.length === JOIN_CODE_LENGTH) {
        onSubmit?.();
      }
    } else {
      return;
    }

    e.preventDefault();
  };

  return (
    <Stack direction="row" spacing={1}>
      {Array.from({ length: JOIN_CODE_LENGTH }, (_, i) => i).map((i) => (
        <Input
          key={i}
          disabled={disabled}
          error={error}
          value={value?.[i] ?? ""}
          onFocus={handleFocus}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          slotProps={{
            input: {
              ref: (el) => {
                inputElementsRef.current[i] = el;
              },
              sx: { textAlign: "center" },
            },
          }}
          sx={{
            fontSize: "2rem",
          }}
        />
      ))}
    </Stack>
  );
};

export default JoinCodeInput;
