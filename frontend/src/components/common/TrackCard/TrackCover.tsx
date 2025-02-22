import { CardCover } from "@mui/joy";

interface TrackCoverProps {
  src: string;
}

const TrackCover = ({ src }: TrackCoverProps) => (
  <>
    <CardCover>
      <img src={src} alt="" />
    </CardCover>
    <CardCover
      sx={{
        background:
          "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0) 150px), " +
          "linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0) 150px)",
        backgroundColor: "rgba(0,0,0,0.2)",
      }}
    />
  </>
);

export default TrackCover;
