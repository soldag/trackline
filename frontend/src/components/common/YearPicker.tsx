import * as _ from "lodash-es";
import { useEffect } from "react";

import ArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import ArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import DoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import DoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { Box, Button, Stack, Typography } from "@mui/joy";
import type { SxProps } from "@mui/joy/styles/types";

const SMALL_STEP = 1;
const LARGE_STEP = 10;

interface YearPickerProps {
  value?: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  onChange?: (value: number) => void;
  sx?: SxProps;
}

const YearPicker = ({
  value = 0,
  min = 0,
  max = new Date().getFullYear(),
  disabled = false,
  onChange,
  sx,
}: YearPickerProps) => {
  const clampedValue = _.clamp(value, min, max);
  const canGoForward = clampedValue < max && !disabled;
  const canGoBackwards = clampedValue > min && !disabled;

  useEffect(() => {
    if (onChange && value !== clampedValue) {
      onChange(clampedValue);
    }
  }, [value, clampedValue, onChange]);

  const handleJump = (step: number) => {
    if (onChange) {
      onChange(Math.max(min, Math.min(max, value + step)));
    }
  };

  return (
    <Stack
      sx={sx}
      direction="row"
      spacing={1}
      alignItems="center"
      justifyContent="space-between"
    >
      <Box>
        <Button
          variant="plain"
          disabled={!canGoBackwards}
          onClick={() => handleJump(-LARGE_STEP)}
        >
          <DoubleArrowLeftIcon />
        </Button>
        <Button
          variant="plain"
          disabled={!canGoBackwards}
          onClick={() => handleJump(-SMALL_STEP)}
        >
          <ArrowLeftIcon />
        </Button>
      </Box>

      <Typography
        textColor={
          disabled ? "neutral.plainDisabledColor" : "neutral.plainColor"
        }
      >
        {clampedValue}
      </Typography>

      <Box>
        <Button
          variant="plain"
          disabled={!canGoForward}
          onClick={() => handleJump(SMALL_STEP)}
        >
          <ArrowRightIcon />
        </Button>
        <Button
          variant="plain"
          disabled={!canGoForward}
          onClick={() => handleJump(LARGE_STEP)}
        >
          <DoubleArrowRightIcon />
        </Button>
      </Box>
    </Stack>
  );
};

export default YearPicker;
