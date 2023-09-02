import PropTypes from "prop-types";

import { CardContent, CircularProgress, Typography } from "@mui/joy";

import YearRange from "~/components/common/YearRange";

const ReleaseYearHeader = ({ loading, year, minYear, maxYear }) => (
  <CardContent sx={{ justifyContent: "flex-start", maxHeight: "32px" }}>
    {loading ? (
      <CircularProgress
        color="neutral"
        size="sm"
        sx={{
          alignSelf: "center",
        }}
      />
    ) : (
      <Typography
        level="h1"
        fontSize="xl"
        textColor="var(--TrackCard-color-primary)"
      >
        {year != null ? year : <YearRange min={minYear} max={maxYear} />}
      </Typography>
    )}
  </CardContent>
);

ReleaseYearHeader.propTypes = {
  loading: PropTypes.bool,
  year: PropTypes.number,
  minYear: PropTypes.number,
  maxYear: PropTypes.number,
};

export default ReleaseYearHeader;
