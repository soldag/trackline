import PropTypes from "prop-types";

import { Card, CardOverflow } from "@mui/joy";

import {
  CreditsGuessType,
  ReleaseYearGuessType,
  TrackType,
} from "~/types/games";
import SxType from "~/types/mui";

import ConfirmFooter from "./ConfirmFooter";
import CreditsFooter from "./CreditsFooter";
import GuessCreditsButton from "./GuessCreditsButton";
import GuessReleaseYearButton from "./GuessReleaseYearButton";
import GuessingContent from "./GuessingContent";
import ReleaseYearHeader from "./ReleaseYearHeader";
import TrackCover from "./TrackCover";

const TrackCard = ({
  sx,
  highlight = false,
  track = null,
  releaseYearGuess = null,
  creditsGuess = null,
  isSelectingPosition = false,
  canGuessReleaseYear = true,
  canGuessCredits = true,
  loadingReleaseYearGuess = false,
  loadingCreditsGuess = false,
  minReleaseYear = null,
  maxReleaseYear = null,
  timeoutStart = null,
  timeoutEnd = null,
  onClick = () => {},
  onIsSelectingPositionChanged = () => {},
  onGuessReleaseYear = () => {},
  onGuessCredits = () => {},
}) => {
  let header;
  let footer;
  if (track != null) {
    header = <ReleaseYearHeader year={track.releaseYear} />;
    footer = <CreditsFooter artists={track.artists} title={track.title} />;
  } else if (
    isSelectingPosition &&
    !loadingReleaseYearGuess &&
    !releaseYearGuess
  ) {
    header = (
      <ReleaseYearHeader minYear={minReleaseYear} maxYear={maxReleaseYear} />
    );
    footer = (
      <ConfirmFooter
        onConfirm={() => onGuessReleaseYear()}
        onCancel={() => onIsSelectingPositionChanged(false)}
      />
    );
  } else {
    header =
      releaseYearGuess == null && !loadingReleaseYearGuess ? (
        <CardOverflow>
          <GuessReleaseYearButton
            disabled={!canGuessReleaseYear}
            onClick={() => onIsSelectingPositionChanged(true)}
          />
        </CardOverflow>
      ) : (
        <ReleaseYearHeader
          loading={loadingReleaseYearGuess}
          year={releaseYearGuess?.year}
        />
      );

    footer =
      creditsGuess == null && !loadingCreditsGuess ? (
        <CardOverflow>
          <GuessCreditsButton
            disabled={!canGuessCredits}
            onClick={onGuessCredits}
          />
        </CardOverflow>
      ) : (
        <CreditsFooter
          loading={loadingCreditsGuess}
          artists={creditsGuess?.artists}
          title={creditsGuess?.title}
        />
      );
  }

  return (
    <Card
      variant={track == null ? "outlined" : "plain"}
      sx={(theme) => ({
        "--TrackCard-size": {
          xs: "230px",
          md: "300px",
          lg: "350px",
        },
        "height": "var(--TrackCard-size)",
        "width": "var(--TrackCard-size)",
        "flexShrink": 0,
        "justifyContent": "space-between",
        "textAlign": "center",
        "userSelect": "none",
        "boxShadow": highlight
          ? `0 10px 20px rgba(11, 107, 203, 0.15),
             0 0 40px rgba(var(--joy-palette-primary-mainChannel) / 0.25)`
          : "sm",
        "borderColor": highlight
          ? theme.vars.palette.primary.plainColor
          : theme.vars.palette.primary.softColor,
        "transition": "box-shadow 0.1s ease-in-out",
        "--Card-radius": "var(--TrackCard-radius, 5px)",
        "--TrackCard-color-primary":
          track == null
            ? theme.vars.palette.neutral[800]
            : theme.vars.palette.neutral[50],
        "--TrackCard-color-secondary":
          track == null
            ? theme.vars.palette.neutral[400]
            : theme.vars.palette.neutral[300],
        ...sx,
      })}
      onClick={onClick}
    >
      {header}

      {track == null ? (
        <GuessingContent timeoutStart={timeoutStart} timeoutEnd={timeoutEnd} />
      ) : (
        <TrackCover src={track.imageUrl} />
      )}

      {footer}
    </Card>
  );
};

TrackCard.propTypes = {
  sx: SxType,
  highlight: PropTypes.bool,
  track: TrackType,
  releaseYearGuess: ReleaseYearGuessType,
  creditsGuess: CreditsGuessType,
  canGuessReleaseYear: PropTypes.bool,
  canGuessCredits: PropTypes.bool,
  loadingReleaseYearGuess: PropTypes.bool,
  loadingCreditsGuess: PropTypes.bool,
  isSelectingPosition: PropTypes.bool,
  minReleaseYear: PropTypes.number,
  maxReleaseYear: PropTypes.number,
  timeoutStart: PropTypes.number,
  timeoutEnd: PropTypes.number,
  onClick: PropTypes.func,
  onIsSelectingPositionChanged: PropTypes.func,
  onGuessReleaseYear: PropTypes.func,
  onGuessCredits: PropTypes.func,
};

export default TrackCard;
