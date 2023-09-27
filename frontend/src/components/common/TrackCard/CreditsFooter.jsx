import PropTypes from "prop-types";

import { CardContent, CircularProgress, Typography } from "@mui/joy";

const ReleaseYearHeader = ({ loading, artists, title }) => (
  <CardContent sx={{ flexGrow: 0, justifyContent: "flex-end" }}>
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
          level="title-md"
          fontWeight="lg"
          textColor="var(--TrackCard-color-primary)"
          sx={{ lineHeight: 1.25 }}
        >
          {title}
        </Typography>
        <Typography
          level="title-md"
          textColor="var(--TrackCard-color-secondary)"
        >
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
