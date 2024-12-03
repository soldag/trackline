import { FormattedMessage } from "react-intl";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Tooltip } from "@mui/joy";

const MaxTokenHint = () => (
  <Tooltip
    arrow
    color="warning"
    placement="bottom-start"
    variant="soft"
    title={
      <FormattedMessage
        id="GameTurnScoringView.MaxTokenHint.tooltip"
        defaultMessage="This player has reached the maximum number of tokens."
      />
    }
    sx={{
      maxWidth: "calc(100vw - 48px)",
    }}
    modifiers={[
      {
        name: "preventOverflow",
        options: { padding: 24 },
      },
    ]}
  >
    <ErrorOutlineIcon color="warning" sx={{ cursor: "pointer" }} />
  </Tooltip>
);

export default MaxTokenHint;
