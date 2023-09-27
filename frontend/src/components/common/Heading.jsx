import { FormattedMessage } from "react-intl";

import AlbumIcon from "@mui/icons-material/Album";
import { Box, Typography } from "@mui/joy";

import SxType from "~/types/mui";

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
      level="h1"
      color="primary"
      startDecorator={<AlbumIcon />}
      slotProps={{
        startDecorator: {
          sx: {
            marginInlineEnd: 0.5,
          },
        },
      }}
      sx={{
        fontSize: "3.75rem",
        mb: 0.25,
      }}
    >
      <FormattedMessage id="Heading.title" defaultMessage="Trackline" />
    </Typography>
    <Typography level="h2" fontSize="xl2" textColor="text.tertiary">
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
