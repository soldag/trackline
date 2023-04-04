import PropTypes from "prop-types";
import QRCode from "react-qr-code";

import { Box, useTheme } from "@mui/joy";

import SxType from "types/mui";

const ResponsiveQrCode = ({ data, sx, onClick }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        width: "100%",
        margin: "0 auto",
        ...sx,
      }}
      onClick={onClick}
    >
      <QRCode
        value={data}
        size={1024}
        fgColor={theme.palette.neutral.plainColor}
        style={{ height: "100%", width: "100%" }}
      />
    </Box>
  );
};
ResponsiveQrCode.propTypes = {
  data: PropTypes.string.isRequired,
  sx: SxType,
  onClick: PropTypes.func,
};

export default ResponsiveQrCode;
