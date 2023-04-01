import PropTypes from "prop-types";
import { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { FormattedMessage } from "react-intl";

import { Stack } from "@mui/joy";

import TrackCard from "components/common/TrackCard";
import YearRange from "components/common/YearRange";
import { TrackType } from "types/games";

import ConfirmGuessModal from "./ConfirmGuessModal";
import ExchangeTrackModal from "./ExchangeTrackModal";
import GuessTrackCard from "./GuessTrackCard";
import RejectGuessModal from "./RejectGuessModal";

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const Timeline = ({
  tracks = [],
  activeTrackId,
  showRange = false,
  canGuessPosition = true,
  canGuessYear = true,
  showExchange = false,
  canExchange = false,
  showReject = false,
  canReject = false,
  timeoutStart,
  timeoutEnd,
  onTracksChange,
  onGuess,
  onReject,
  onExchange,
}) => {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);

  const index = tracks.findIndex((t) => t.spotifyId === activeTrackId);
  const minYear = tracks[index - 1]?.releaseYear;
  const maxYear = tracks[index + 1]?.releaseYear;

  const handleDragStart = () => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(100);
    }
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
    if (!canGuessPosition) {
      return;
    }

    onTracksChange(reorder(tracks, index, newIndex));
  };

  const cardHeader = showRange ? (
    <YearRange min={minYear} max={maxYear} />
  ) : (
    <FormattedMessage
      id="GameTurnGuessingView.Timeline.cardHeader.guess"
      defaultMessage="Guess the song!"
    />
  );

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <ConfirmGuessModal
        open={confirmModalOpen}
        minYear={minYear}
        maxYear={maxYear}
        canGuessYear={canGuessYear}
        onConfirm={onGuess}
        onClose={() => setConfirmModalOpen(false)}
      />
      <RejectGuessModal
        open={rejectModalOpen}
        onConfirm={onReject}
        onClose={() => setRejectModalOpen(false)}
      />
      <ExchangeTrackModal
        open={exchangeModalOpen}
        onConfirm={onExchange}
        onClose={() => setExchangeModalOpen(false)}
      />

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
                key={track.spotifyId}
                draggableId={track.spotifyId}
                index={i}
                isDragDisabled={
                  !canGuessPosition || track.spotifyId !== activeTrackId
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
                      <GuessTrackCard
                        header={cardHeader}
                        canConfirm={canGuessPosition}
                        showReject={showReject}
                        canReject={canReject}
                        showExchange={showExchange}
                        canExchange={canExchange}
                        timeoutStart={timeoutStart}
                        timeoutEnd={timeoutEnd}
                        onConfirm={() => setConfirmModalOpen(true)}
                        onReject={() => setRejectModalOpen(true)}
                        onExchange={() => setExchangeModalOpen(true)}
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
  showRange: PropTypes.bool,
  canGuessPosition: PropTypes.bool,
  canGuessYear: PropTypes.bool,
  showReject: PropTypes.bool,
  canReject: PropTypes.bool,
  showExchange: PropTypes.bool,
  canExchange: PropTypes.bool,
  timeoutStart: PropTypes.number,
  timeoutEnd: PropTypes.number,
  onTracksChange: PropTypes.func.isRequired,
  onGuess: PropTypes.func,
  onReject: PropTypes.func,
  onExchange: PropTypes.func,
};

export default Timeline;
