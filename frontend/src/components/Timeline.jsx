import PropTypes from "prop-types";
import { useCallback } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

import Stack from "@mui/joy/Stack";

import TrackCard from "components/TrackCard";
import TrackType from "types/track";

import GuessTrackCard from "./GuessTrackCard";

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const Timeline = ({ tracks = [], activeTrackId, onTracksChange }) => {
  const handleDragStart = useCallback(() => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(100);
    }
  }, []);

  const handleDragEnd = useCallback(
    (result) => {
      if (!result.destination) {
        return;
      }

      onTracksChange(
        reorder(tracks, result.source.index, result.destination.index),
      );
    },
    [tracks, onTracksChange],
  );

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Droppable droppableId="droppable" direction="horizontal">
        {(provided) => (
          <Stack
            ref={provided.innerRef}
            direction="row"
            alignItems="center"
            spacing={1}
            {...provided.droppableProps}
          >
            {tracks.map((track, i) => (
              <Draggable
                key={track.id}
                draggableId={track.id.toString()}
                index={i}
                isDragDisabled={track.id !== activeTrackId}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={provided.draggableProps.style}
                  >
                    {track.id === activeTrackId ? (
                      <GuessTrackCard />
                    ) : (
                      <TrackCard track={track} />
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
  activeTrackId: PropTypes.number,
  onTracksChange: PropTypes.func.isRequired,
};

export default Timeline;
