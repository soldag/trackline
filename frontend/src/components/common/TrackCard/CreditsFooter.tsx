import { CardContent, CircularProgress, Typography } from "@mui/joy";

interface ReleaseYearHeaderProps {
  loading?: boolean;
  artists?: string[];
  title?: string;
}

const ReleaseYearHeader = ({
  loading,
  artists,
  title,
}: ReleaseYearHeaderProps) => (
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
          sx={{
            lineHeight: 1.25,
            overflow: "hidden",
            display: "-webkit-box",
            lineClamp: "2",
            WebkitLineClamp: "2",
            WebkitBoxOrient: "vertical",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </Typography>
        <Typography
          level="title-md"
          textColor="var(--TrackCard-color-secondary)"
          sx={{
            overflow: "hidden",
            display: "-webkit-box",
            lineClamp: "2",
            WebkitLineClamp: "2",
            WebkitBoxOrient: "vertical",
            textOverflow: "ellipsis",
          }}
        >
          {artists?.join(", ")}
        </Typography>
      </>
    )}
  </CardContent>
);

export default ReleaseYearHeader;
