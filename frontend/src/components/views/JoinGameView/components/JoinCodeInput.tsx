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
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const values = useMemo(
    () => Array.from({ length: JOIN_CODE_LENGTH }, (_, i) => value?.[i] ?? ""),
    [value],
  );

  useMountEffect(() => {
    if (!isMobile()) {
      focusInput(0);
    }
  });

  const focusInput = (index: number) => inputRefs.current[index]?.focus();

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

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.key === "Tab") {
      return;
    }

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
    } else if (e.key.length === 1) {
      const char = e.key.toUpperCase();
      if (JOIN_CODE_CHAR_REGEX.test(char)) {
        setCharAt(index, char);
      }
    }

    e.preventDefault();
  };

  const handlePaste = (index: number, e: React.ClipboardEvent) => {
    e.preventDefault();

    const data = e.clipboardData
      .getData("text/plain")
      .slice(0, JOIN_CODE_LENGTH - index)
      .toUpperCase();

    const fullRegex = new RegExp(
      `^${JOIN_CODE_CHAR_REGEX.source}{${data.length}$`,
    );
    if (!fullRegex.test(data)) {
      return;
    }

    const newValue = values
      .map((char, i) => (i < index ? char : (data[i - index] ?? char)))
      .join("");
    onChange?.(newValue);

    focusInput(Math.min(JOIN_CODE_LENGTH - 1, index + data.length));
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
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          slotProps={{
            input: {
              ref: (el) => {
                inputRefs.current[i] = el;
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
