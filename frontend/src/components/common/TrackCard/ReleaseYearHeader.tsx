import { CardContent, CircularProgress, Typography } from "@mui/joy";

import YearRange from "@/components/common/YearRange";

interface ReleaseYearHeaderProps {
  loading?: boolean;
  year?: number;
  minYear?: number;
  maxYear?: number;
}

const ReleaseYearHeader = ({
  loading,
  year,
  minYear,
  maxYear,
}: ReleaseYearHeaderProps) => (
  <CardContent
    sx={{
      flexGrow: 0,
      justifyContent: "flex-start",
    }}
  >
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
        level="title-lg"
        fontSize="xl"
        textColor="var(--TrackCard-color-primary)"
      >
        {year != null ? year : <YearRange min={minYear} max={maxYear} />}
      </Typography>
    )}
  </CardContent>
);

export default ReleaseYearHeader;
