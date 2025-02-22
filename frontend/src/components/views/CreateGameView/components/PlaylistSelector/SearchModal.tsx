import { useEffect, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";

import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogTitle,
  IconButton,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from "@mui/joy";

import { AppError } from "@/types/errors";
import { SpotifyPlaylist } from "@/types/spotify";

import PlaylistList from "./PlaylistList";

interface RecommendationsListProps {
  items?: SpotifyPlaylist[];
  error?: AppError;
  selectedItems?: SpotifyPlaylist[];
  onSelectedItemsChange?: (values: SpotifyPlaylist[]) => void;
}

const RecommendationsList = ({
  items = [],
  error,
  selectedItems = [],
  onSelectedItemsChange = () => {},
}: RecommendationsListProps) => {
  return error ? (
    <Typography level="body-sm" color="danger">
      <FormattedMessage
        id="CreateGameView.PlaylistSelector.SearchModal.recommendations.error"
        defaultMessage="Failed to retrieve recommended playlists."
      />
    </Typography>
  ) : (
    <PlaylistList
      selection
      items={items}
      selectedItems={selectedItems}
      onSelectedItemsChange={onSelectedItemsChange}
    />
  );
};

interface SearchResultsListProps {
  items?: SpotifyPlaylist[];
  error?: AppError;
  loading?: boolean;
  queryLength?: number;
  minQueryLength?: number;
  selectedItems?: SpotifyPlaylist[];
  onSelectedItemsChange?: (value: SpotifyPlaylist[]) => void;
}

const SearchResultsList = ({
  items = [],
  loading = false,
  error,
  queryLength = 0,
  minQueryLength = 0,
  selectedItems = [],
  onSelectedItemsChange = () => {},
}: SearchResultsListProps) => {
  return error ? (
    <Typography level="body-sm" color="danger">
      <FormattedMessage
        id="CreateGameView.PlaylistSelector.SearchModal.searchResults.error"
        defaultMessage="Failed to search playlists."
      />
    </Typography>
  ) : (
    <PlaylistList
      selection
      items={items}
      selectedItems={selectedItems}
      emptyText={
        !loading &&
        (queryLength < minQueryLength ? (
          <FormattedMessage
            id="CreateGameView.PlaylistSelector.SearchModal.searchResults.shortQuery"
            defaultMessage="Please enter at least {minQueryLength} characters."
            values={{ minQueryLength }}
          />
        ) : (
          <FormattedMessage
            id="CreateGameView.PlaylistSelector.SearchModal.searchResults.noResults"
            defaultMessage="No playlists found."
          />
        ))
      }
      onSelectedItemsChange={onSelectedItemsChange}
    />
  );
};

interface SearchModalProps {
  open?: boolean;
  onClose?: () => void;
  query?: string;
  onQueryChange?: (value: string) => void;
  minQueryLength?: number;
  selection?: SpotifyPlaylist[];
  onSelectionChange?: (value: SpotifyPlaylist[]) => void;
  recommendationsLoading?: boolean;
  recommendationsError?: AppError;
  recommendations?: SpotifyPlaylist[];
  searchLoading?: boolean;
  searchError?: AppError;
  searchResults?: SpotifyPlaylist[];
}

const SearchModal = ({
  open = false,
  onClose = () => {},
  query = "",
  onQueryChange = () => {},
  minQueryLength = 0,
  selection = [],
  onSelectionChange = () => {},
  recommendationsLoading = false,
  recommendationsError,
  recommendations = [],
  searchLoading = false,
  searchError,
  searchResults = [],
}: SearchModalProps) => {
  const listContainerRef = useRef<HTMLDivElement>();
  const [newSelection, setNewSelection] = useState(selection);

  useEffect(() => setNewSelection(selection), [selection]);

  useEffect(() => {
    listContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [query]);

  const handleConfirm = () => {
    onSelectionChange(newSelection);
    onClose();
  };

  const handleCancel = () => {
    setNewSelection(selection);
    onClose();
  };

  const showLoader =
    (recommendations.length === 0 && recommendationsLoading) ||
    (searchResults.length === 0 && searchLoading);

  return (
    <Modal open={open} onClose={handleCancel}>
      <ModalDialog
        layout="fullscreen"
        sx={{ display: "flex", flexDirection: "column" }}
      >
        <DialogTitle>
          <FormattedMessage
            id="CreateGameView.PlaylistSelector.SearchModal.modalHeader"
            defaultMessage="Select playlists"
          />
        </DialogTitle>
        <ModalClose />

        <FormattedMessage
          id="CreateGameView.PlaylistSelector.SearchModal.search.placeholder"
          defaultMessage="Search..."
        >
          {([placeholder]) => (
            <Input
              fullWidth
              variant="soft"
              placeholder={placeholder as string}
              startDecorator={<SearchIcon />}
              endDecorator={
                query.length > 0 && (
                  <IconButton variant="soft" onClick={() => onQueryChange("")}>
                    <ClearIcon />
                  </IconButton>
                )
              }
              sx={{ mt: 2, mb: 1 }}
              value={query}
              onChange={({ target: { value } }) => onQueryChange(value)}
            />
          )}
        </FormattedMessage>

        <Typography
          sx={{
            fontSize: "xs",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "text.secondary",
          }}
        >
          {query.length === 0 ? (
            <FormattedMessage
              id="CreateGameView.PlaylistSelector.SearchModal.recommendations.header"
              defaultMessage="Recommendations"
            />
          ) : (
            <FormattedMessage
              id="CreateGameView.PlaylistSelector.SearchModal.searchResults.header"
              defaultMessage="Search results"
            />
          )}
        </Typography>

        <Box
          ref={listContainerRef}
          sx={{
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
            flexGrow: 1,
          }}
        >
          {query.length === 0 ? (
            <RecommendationsList
              items={recommendations}
              error={recommendationsError}
              selectedItems={newSelection}
              onSelectedItemsChange={setNewSelection}
            />
          ) : (
            <SearchResultsList
              items={searchResults}
              error={searchError}
              loading={showLoader}
              queryLength={query.length}
              minQueryLength={minQueryLength}
              selectedItems={newSelection}
              onSelectedItemsChange={setNewSelection}
            />
          )}

          {showLoader && (
            <Box
              sx={{ display: "flex", justifyContent: "center", flexGrow: 1 }}
            >
              <CircularProgress thickness={5} />
            </Box>
          )}
        </Box>

        <DialogActions>
          <Button onClick={handleConfirm}>
            <FormattedMessage
              id="CreateGameView.PlaylistSelector.SearchModal.select"
              defaultMessage="Select"
            />
          </Button>
          <Button variant="plain" color="neutral" onClick={handleCancel}>
            <FormattedMessage
              id="CreateGameView.PlaylistSelector.SearchModal.cancel"
              defaultMessage="Cancel"
            />
          </Button>
          <Typography level="body-sm" sx={{ flexGrow: 1 }}>
            <FormattedMessage
              id="CreateGameView.PlaylistSelector.SearchModal.selectionSummary"
              defaultMessage="{count, plural, =0 {No playlists} =1 {#{nbsp}playlist} other {#{nbsp}playlists}} selected"
              values={{ count: newSelection.length, nbsp: <>&nbsp;</> }}
            />
          </Typography>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};

export default SearchModal;
