import PropTypes from "prop-types";
import { useCallback } from "react";

import ArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import ArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import DoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import DoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Stack from "@mui/joy/Stack";

import SxType from "types/mui";

const MIN_YEAR = 0;
const SMALL_STEP = 1;
const LARGE_STEP = 10;

const YearPicker = ({ value, onChange, sx }) => {
  // Current year might change after component has been imported
  const MAX_YEAR = new Date().getFullYear();

  const canGoForward = value < MAX_YEAR;
  const canGoBackwards = value > MIN_YEAR;

  const handleJump = useCallback(
    (step) => {
      if (onChange) {
        onChange(Math.max(MIN_YEAR, Math.min(MAX_YEAR, value + step)));
      }
    },
    [MAX_YEAR, value, onChange],
  );

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

      {value}

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
  onChange: PropTypes.func,
};

export default YearPicker;
