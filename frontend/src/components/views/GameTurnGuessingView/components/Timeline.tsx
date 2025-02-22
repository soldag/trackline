import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import { SortableContext, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PropsWithChildren, useEffect, useState } from "react";

import { Box, Stack } from "@mui/joy";

import TrackCard from "@/components/common/TrackCard";
import { CreditsGuess, ReleaseYearGuess, Track } from "@/types/games";
import { useBreakpoint } from "@/utils/hooks";

interface SortableItemProps {
  id: string;
  disabled?: boolean;
}

const SortableItem = ({
  id,
  disabled = false,
  children,
}: PropsWithChildren<SortableItemProps>) => {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id, disabled });

  return (
    <Box
      {...attributes}
      {...listeners}
      ref={setNodeRef}
      sx={[
        {
          touchAction: "manipulation",
          transform: CSS.Transform.toString(transform),
          transition,
        },
        !disabled && {
          cursor: isDragging ? "grabbing" : "grab",
        },
        isDragging && {
          zIndex: 1,
        },
      ]}
    >
      {children}
    </Box>
  );
};

interface TimelineProps {
  tracks?: Track[];
  activeTrackId?: string;
  releaseYearGuess?: ReleaseYearGuess;
  creditsGuess?: CreditsGuess;
  canGuessReleaseYear?: boolean;
  canGuessCredits?: boolean;
  loadingReleaseYearGuess?: boolean;
  loadingCreditsGuess?: boolean;
  timeoutStart?: number;
  timeoutEnd?: number;
  onTracksChange?: (tracks: Track[]) => void;
  onGuessReleaseYear?: () => void;
  onGuessCredits?: () => void;
}

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
}: TimelineProps) => {
  const isVertical = useBreakpoint((breakpoints) => breakpoints.only("xs"));

  const [isDragging, setIsDragging] = useState(false);
  const [isSelectingPosition, setIsSelectingPosition] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 1 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
  );

  const index = tracks.findIndex((t) => t.spotifyId === activeTrackId);
  const minYear = tracks[index - 1]?.releaseYear;
  const maxYear = tracks[index + 1]?.releaseYear;

  const handleDragStart = () => {
    setIsDragging(true);
    setIsSelectingPosition(true);
    window.navigator.vibrate?.(40);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    window.navigator.vibrate?.(40);

    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tracks.findIndex(
        (track) => track.spotifyId === active.id,
      );
      const newIndex = tracks.findIndex((track) => track.spotifyId === over.id);

      onTracksChange?.(arrayMove(tracks, oldIndex, newIndex));
    }
  };

  const handleTrackClick = (newIndex: number) => {
    if (isSelectingPosition) {
      onTracksChange?.(arrayMove(tracks, index, newIndex));
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
    <Box
      sx={{
        py: { xs: 2, sm: 0 },
        px: { sm: 2 },
      }}
    >
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        alignItems="center"
        spacing={1}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[
            restrictToParentElement,
            isVertical ? restrictToVerticalAxis : restrictToHorizontalAxis,
          ]}
        >
          <SortableContext items={tracks.map((track) => track.spotifyId)}>
            {tracks.map((track, i) => (
              <SortableItem
                key={track.spotifyId}
                id={track.spotifyId}
                disabled={
                  !canGuessReleaseYear ||
                  loadingReleaseYearGuess ||
                  track.spotifyId !== activeTrackId
                }
              >
                {track.spotifyId === activeTrackId ? (
                  <TrackCard
                    highlight={isDragging}
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
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
      </Stack>
    </Box>
  );
};

export default Timeline;
