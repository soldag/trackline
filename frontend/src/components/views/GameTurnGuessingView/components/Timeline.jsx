import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

import { Stack } from "@mui/joy";

import TrackCard from "~/components/common/TrackCard";
import {
  CreditsGuessType,
  ReleaseYearGuessType,
  TrackType,
} from "~/types/games";
import { useBreakpoint } from "~/utils/hooks";

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const Timeline = ({
  tracks = [],
  activeTrackId,
  releaseYearGuess,
  creditsGuess,
  canGuessReleaseYear,
  canGuessCredits,
  loadingReleaseYearGuess,
  loadingCreditsGuess,
  timeoutStart,
  timeoutEnd,
  onTracksChange,
  onGuessReleaseYear,
  onGuessCredits,
}) => {
  const isScreenXs = useBreakpoint((breakpoints) => breakpoints.only("xs"));

  const [isSelectingPosition, setIsSelectingPosition] = useState(false);

  const index = tracks.findIndex((t) => t.spotifyId === activeTrackId);
  const minYear = tracks[index - 1]?.releaseYear;
  const maxYear = tracks[index + 1]?.releaseYear;

  const handleDragStart = () => {
    window.navigator.vibrate?.(100);
    setIsSelectingPosition(true);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    onTracksChange(
      reorder(tracks, result.source.index, result.destination.index),
    );
  };

  const handleTrackClick = (newIndex) => {
    if (isSelectingPosition) {
      onTracksChange(reorder(tracks, index, newIndex));
    }
  };

  useEffect(() => {
    if (isSelectingPosition && releaseYearGuess) {
      setIsSelectingPosition(false);
    }
  }, [isSelectingPosition, releaseYearGuess]);

  useEffect(() => {
    if (!canGuessReleaseYear && isSelectingPosition) {
      setIsSelectingPosition(false);
    }
  }, [canGuessReleaseYear, isSelectingPosition]);

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Droppable
        droppableId="droppable"
        direction={isScreenXs ? "vertical" : "horizontal"}
      >
        {(provided) => (
          <Stack
            ref={provided.innerRef}
            direction={{
              xs: "column",
              sm: "row",
            }}
            alignItems="center"
            spacing={1}
            sx={{
              py: { xs: 2, sm: 0 },
              px: { sm: 2 },
            }}
            {...provided.droppableProps}
          >
            {tracks.map((track, i) => (
              <Draggable
                key={track.spotifyId}
                draggableId={track.spotifyId}
                index={i}
                isDragDisabled={
                  !canGuessReleaseYear ||
                  loadingReleaseYearGuess ||
                  track.spotifyId !== activeTrackId
                }
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={provided.draggableProps.style}
                  >
                    {track.spotifyId === activeTrackId ? (
                      <TrackCard
                        releaseYearGuess={releaseYearGuess}
                        creditsGuess={creditsGuess}
                        canGuessReleaseYear={canGuessReleaseYear}
                        canGuessCredits={canGuessCredits}
                        loadingReleaseYearGuess={loadingReleaseYearGuess}
                        loadingCreditsGuess={loadingCreditsGuess}
                        isSelectingPosition={isSelectingPosition}
                        minReleaseYear={minYear}
                        maxReleaseYear={maxYear}
                        timeoutStart={timeoutStart}
                        timeoutEnd={timeoutEnd}
                        onIsSelectingPositionChanged={setIsSelectingPosition}
                        onGuessReleaseYear={onGuessReleaseYear}
                        onGuessCredits={onGuessCredits}
                      />
                    ) : (
                      <TrackCard
                        track={track}
                        onClick={() => handleTrackClick(i)}
                      />
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Stack>
        )}
      </Droppable>
    </DragDropContext>
  );
};

Timeline.propTypes = {
  tracks: PropTypes.arrayOf(TrackType),
  activeTrackId: PropTypes.string,
  releaseYearGuess: ReleaseYearGuessType,
  creditsGuess: CreditsGuessType,
  canGuessReleaseYear: PropTypes.bool,
  canGuessCredits: PropTypes.bool,
  loadingReleaseYearGuess: PropTypes.bool,
  loadingCreditsGuess: PropTypes.bool,
  timeoutStart: PropTypes.number,
  timeoutEnd: PropTypes.number,
  onTracksChange: PropTypes.func.isRequired,
  onGuessReleaseYear: PropTypes.func.isRequired,
  onGuessCredits: PropTypes.func.isRequired,
};

export default Timeline;
