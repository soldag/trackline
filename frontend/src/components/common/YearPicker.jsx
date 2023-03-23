import clamp from "lodash/clamp";
import PropTypes from "prop-types";
import { useEffect } from "react";

import ArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import ArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import DoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import DoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";

import SxType from "types/mui";

const SMALL_STEP = 1;
const LARGE_STEP = 10;

const YearPicker = ({
  value,
  min = 0,
  max = new Date().getFullYear(),
  disabled = false,
  onChange,
  sx,
}) => {
  const clampedValue = clamp(value, min, max);
  const canGoForward = clampedValue < max && !disabled;
  const canGoBackwards = clampedValue > min && !disabled;

  useEffect(() => {
    if (onChange && value !== clampedValue) {
      onChange(clampedValue);
    }
  }, [value, clampedValue, onChange]);

  const handleJump = (step) => {
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

YearPicker.propTypes = {
  sx: SxType,
  value: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
};

export default YearPicker;
