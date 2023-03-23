import PropTypes from "prop-types";

import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import LoopIcon from "@mui/icons-material/Loop";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";

import CircularCountdown from "components/common/CircularCountdown";

const GuessTrackCard = ({
  header,
  canConfirm = true,
  showExchange = false,
  canExchange = false,
  showReject = false,
  canReject = false,
  timeoutStart = null,
  timeoutEnd = null,
  onConfirm = () => {},
  onReject = () => {},
  onExchange = () => {},
}) => (
  <Card
    variant="outlined"
    sx={(theme) => ({
      "height": {
        xs: 230,
        md: 300,
        lg: 350,
      },
      "width": {
        xs: 230,
        md: 300,
        lg: 350,
      },
      "flexShrink": 0,
      "textAlign": "center",
      "--Card-radius": "5px",
      "boxShadow": "sm",
      "borderColor": theme.vars.palette.primary.outlinedHoverBorder,
    })}
  >
    <CardContent sx={{ justifyContent: "flex-start", flexGrow: 0 }}>
      <Typography level="h1" fontSize="xl">
        {header}
      </Typography>
    </CardContent>

    <CardContent
      sx={{ justifyContent: "center", alignItems: "center", flexGrow: 1 }}
    >
      {timeoutStart == null || timeoutEnd == null ? (
        <AudiotrackIcon
          sx={{
            fontSize: {
              xs: "96px",
              md: "125px",
              lg: "150px",
            },
          }}
        />
      ) : (
        <CircularCountdown
          defaultColor="success"
          start={timeoutStart}
          timeout={timeoutEnd}
        />
      )}
    </CardContent>

    <CardContent
      sx={{
        "justifyContent": "flex-end",
        "flexGrow": 0,
        "flexDirection": "row",
        "& button": {
          "flexGrow": 1,
          "&:not(:first-child)": { ml: "3px" },
          "&:not(:last-child)": { mr: "3px" },
        },
      }}
    >
      {showExchange && (
        <Button
          variant="soft"
          color="neutral"
          disabled={!canExchange}
          onClick={onExchange}
        >
          <LoopIcon />
        </Button>
      )}
      {showReject && (
        <Button
          variant="soft"
          color="danger"
          disabled={!canReject}
          onClick={onReject}
        >
          <CloseIcon />
        </Button>
      )}
      <Button
        variant="soft"
        color="success"
        disabled={!canConfirm}
        onClick={onConfirm}
      >
        <CheckIcon />
      </Button>
    </CardContent>
  </Card>
);

GuessTrackCard.propTypes = {
  header: PropTypes.node,
  canConfirm: PropTypes.bool,
  showReject: PropTypes.bool,
  canReject: PropTypes.bool,
  showExchange: PropTypes.bool,
  canExchange: PropTypes.bool,
  timeoutStart: PropTypes.number,
  timeoutEnd: PropTypes.number,
  onConfirm: PropTypes.func,
  onReject: PropTypes.func,
  onExchange: PropTypes.func,
};

export default GuessTrackCard;
