import PropTypes from "prop-types";

import TokenIcon from "@mui/icons-material/Token";
import WebStoriesIcon from "@mui/icons-material/WebStories";
import { Typography } from "@mui/joy";

import NumericDelta from "~/components/common/NumericDelta";

const ScoringResult = ({ isCorrect, tracksDelta, tokensDelta, children }) => (
  <Typography
    fontSize="inherit"
    sx={{
      display: "flex",
      alignItems: "center",
      columnGap: 1,
      flexWrap: "wrap",
    }}
  >
    <Typography fontSize="inherit" color={isCorrect ? "success" : "danger"}>
      {children}
    </Typography>
    <Typography
      fontSize="inherit"
      sx={{
        display: "flex",
        alignItems: "center",
        columnGap: 1,
      }}
    >
      {tracksDelta != null && (
        <NumericDelta value={tracksDelta} icon={<WebStoriesIcon />} />
      )}
      {tokensDelta != null && (
        <NumericDelta value={tokensDelta} icon={<TokenIcon />} />
      )}
    </Typography>
  </Typography>
);

ScoringResult.propTypes = {
  isCorrect: PropTypes.bool,
  tracksDelta: PropTypes.number,
  tokensDelta: PropTypes.number,
  children: PropTypes.node,
};

export default ScoringResult;
