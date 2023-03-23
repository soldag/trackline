import { FormattedMessage } from "react-intl";

import AlbumIcon from "@mui/icons-material/Album";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";

import SxType from "types/mui";

const Heading = ({ sx }) => (
  <Box
    sx={{
      ...sx,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}
  >
    <Typography
      level="display2"
      textColor="primary.softColor"
      startDecorator={<AlbumIcon />}
      slotProps={{
        startDecorator: {
          sx: {
            marginInlineEnd: "4px",
          },
        },
      }}
    >
      <FormattedMessage id="Heading.title" defaultMessage="Trackline" />
    </Typography>
    <Typography level="h2" fontSize="xl2" textColor="neutral.600">
      <FormattedMessage
        id="Heading.tagline"
        defaultMessage="Guess your favorite songs!"
      />
    </Typography>
  </Box>
);

Heading.propTypes = {
  sx: SxType,
};

export default Heading;
