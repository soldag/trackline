import QRCode from "react-qr-code";

import { Box, useTheme } from "@mui/joy";
import type { SxProps } from "@mui/joy/styles/types";

interface ResponsiveQrCodeProps {
  data: string;
  sx?: SxProps;
  onClick?: () => void;
}

const ResponsiveQrCode = ({ data, sx, onClick }: ResponsiveQrCodeProps) => {
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

export default ResponsiveQrCode;
