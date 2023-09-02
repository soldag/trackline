import PropTypes from "prop-types";

import { CardContent, CircularProgress, Typography } from "@mui/joy";

const ReleaseYearHeader = ({ loading, artists, title }) => (
  <CardContent sx={{ justifyContent: "flex-end" }}>
    {loading ? (
      <CircularProgress
        color="neutral"
        size="sm"
        sx={{
          alignSelf: "center",
        }}
      />
    ) : (
      <>
        <Typography
          level="h2"
          fontSize="md"
          textColor="var(--TrackCard-color-primary)"
        >
          {title}
        </Typography>
        <Typography fontSize="md" textColor="var(--TrackCard-color-secondary)">
          {artists?.join(", ")}
        </Typography>
      </>
    )}
  </CardContent>
);

ReleaseYearHeader.propTypes = {
  loading: PropTypes.bool,
  artists: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string,
};

export default ReleaseYearHeader;
