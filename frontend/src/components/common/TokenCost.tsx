import TokenIcon from "@mui/icons-material/Token";
import { Box } from "@mui/joy";
import { SxProps } from "@mui/joy/styles/types";

import { mergeSx } from "@/utils/style";

interface TokenCostProps {
  cost: number;
  sx?: SxProps;
}
const TokenCost = ({ cost, sx }: TokenCostProps) => (
  <Box sx={mergeSx(sx, { display: "flex", alignItems: "center" })}>
    ({cost}&nbsp;
    <TokenIcon sx={{ height: "0.8em", width: "0.8em" }} />)
  </Box>
);

export default TokenCost;
