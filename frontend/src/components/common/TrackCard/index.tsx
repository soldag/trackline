import { Card, CardOverflow } from "@mui/joy";
import type { SxProps } from "@mui/joy/styles/types";

import { CreditsGuess, ReleaseYearGuess, Track } from "@/types/games";
import { mergeSx } from "@/utils/style";

import ConfirmFooter from "./ConfirmFooter";
import CreditsFooter from "./CreditsFooter";
import GuessCreditsButton from "./GuessCreditsButton";
import GuessReleaseYearButton from "./GuessReleaseYearButton";
import GuessingContent from "./GuessingContent";
import ReleaseYearHeader from "./ReleaseYearHeader";
import TrackCover from "./TrackCover";

interface TrackCardProps {
  sx?: SxProps;
  highlight?: boolean;
  track?: Track;
  releaseYearGuess?: ReleaseYearGuess;
  creditsGuess?: CreditsGuess;
  isSelectingPosition?: boolean;
  canGuessReleaseYear?: boolean;
  canGuessCredits?: boolean;
  tokenCostGuessReleaseYear?: number;
  tokenCostGuessCredits?: number;
  loadingReleaseYearGuess?: boolean;
  loadingCreditsGuess?: boolean;
  minReleaseYear?: number;
  maxReleaseYear?: number;
  timeoutStart?: number;
  timeoutEnd?: number;
  onClick?: () => void;
  onIsSelectingPositionChanged?: (value: boolean) => void;
  onGuessReleaseYear?: () => void;
  onGuessCredits?: () => void;
}

const TrackCard = ({
  sx,
  highlight = false,
  track,
  releaseYearGuess,
  creditsGuess,
  isSelectingPosition = false,
  canGuessReleaseYear = true,
  canGuessCredits = true,
  tokenCostGuessReleaseYear,
  tokenCostGuessCredits,
  loadingReleaseYearGuess = false,
  loadingCreditsGuess = false,
  minReleaseYear,
  maxReleaseYear,
  timeoutStart,
  timeoutEnd,
  onClick = () => {},
  onIsSelectingPositionChanged = () => {},
  onGuessReleaseYear = () => {},
  onGuessCredits = () => {},
}: TrackCardProps) => {
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
            tokenCost={tokenCostGuessReleaseYear}
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
            tokenCost={tokenCostGuessCredits}
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
      sx={mergeSx(
        (theme) => ({
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
        }),
        sx,
      )}
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

export default TrackCard;
