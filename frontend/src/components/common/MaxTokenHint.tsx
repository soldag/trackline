import { FormattedMessage } from "react-intl";

import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
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
    <ErrorOutlinedIcon color="warning" sx={{ cursor: "pointer" }} />
  </Tooltip>
);

export default MaxTokenHint;
