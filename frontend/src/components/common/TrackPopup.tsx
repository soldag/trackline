import { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import {
  AspectRatio,
  Button,
  Card,
  CardActions,
  CardContent,
  CardOverflow,
  Typography,
} from "@mui/joy";

import Popup, { PopupProps } from "@/components/common/Popup";
import TrackCard from "@/components/common/TrackCard";
import { Track } from "@/types/games";

interface TrackPopupProps extends Omit<PopupProps, "children"> {
  track?: Track | null;
  header?: ReactNode;
  description?: ReactNode;
}

const TrackPopup = ({
  track,
  header,
  description,
  onClose,
  ...remainingProps
}: TrackPopupProps) => {
  if (!track) {
    return null;
  }

  return (
    <Popup {...remainingProps} onClose={onClose}>
      <Card
        variant="plain"
        sx={{
          "outline": "none",
          "textAlign": "center",
          "alignItems": "center",
          "--TrackPopup-width": "min(400px, calc(100vw - 50px))",
          "width": "var(--TrackPopup-width)",
        }}
      >
        <CardOverflow>
          <AspectRatio ratio="1">
            <TrackCard
              track={track}
              sx={{
                "--TrackCard-radius": 0,
                "--TrackCard-size": {
                  xs: "var(--TrackPopup-width)",
                },
              }}
            />
          </AspectRatio>
        </CardOverflow>

        {header && (
          <Typography level="title-lg" sx={{ mt: 1 }}>
            {header}
          </Typography>
        )}

        {description && <CardContent>{description}</CardContent>}

        <CardActions sx={{ width: "100%" }}>
          <Button variant="solid" onClick={onClose}>
            <FormattedMessage
              id="TrackPopup.continue"
              defaultMessage="Continue"
            />
          </Button>
        </CardActions>
      </Card>
    </Popup>
  );
};

export default TrackPopup;
