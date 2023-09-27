import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";

import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Input,
  List,
  ListItem,
  ListSubheader,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from "@mui/joy";

import { ErrorType } from "~/types/errors";
import PlaylistType from "~/types/spotify";

import PlaylistList from "./PlaylistList";

const ListError = ({ children }) => (
  <Typography level="body-sm" color="danger" sx={{ ml: "5px" }}>
    {children}
  </Typography>
);

ListError.propTypes = {
  children: PropTypes.node,
};

const SearchModal = ({
  open = false,
  onClose = () => {},
  query = "",
  onQueryChange = () => {},
  minQueryLength = 0,
  selection = [],
  onSelectionChange = () => {},
  recommendationsLoading = false,
  recommendationsError = null,
  recommendations = [],
  searchLoading = false,
  searchError = null,
  searchResults = [],
}) => {
  const listContainerRef = useRef();
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
        <ModalClose />
        <Typography>
          <FormattedMessage
            id="CreateGameView.PlaylistSelector.SearchModal.modalHeader"
            defaultMessage="Select playlists"
          />
        </Typography>

        <FormattedMessage
          id="CreateGameView.PlaylistSelector.SearchModal.search.placeholder"
          defaultMessage="Search..."
        >
          {([placeholder]) => (
            <Input
              autoFocus
              fullWidth
              variant="soft"
              placeholder={placeholder}
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

        <Box
          ref={listContainerRef}
          sx={{
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
            flexGrow: 1,
          }}
        >
          <List
            sx={{
              "padding": 0,
              "--List-item-paddingY": "0px",
              "--List-item-paddingX": "0px",
            }}
          >
            {query.length === 0 ? (
              <ListItem nested>
                <ListSubheader sticky>
                  <FormattedMessage
                    id="CreateGameView.PlaylistSelector.SearchModal.recommendations.header"
                    defaultMessage="Recommendations"
                  />
                </ListSubheader>
                {recommendationsError ? (
                  <ListError>
                    <FormattedMessage
                      id="CreateGameView.PlaylistSelector.SearchModal.recommendations.error"
                      defaultMessage="Failed to retrieve recommended playlists."
                    />
                  </ListError>
                ) : (
                  <PlaylistList
                    selection
                    items={recommendations}
                    selectedItems={newSelection}
                    onSelectedItemsChange={setNewSelection}
                  />
                )}
              </ListItem>
            ) : (
              <ListItem nested>
                <ListSubheader sticky>
                  <FormattedMessage
                    id="CreateGameView.PlaylistSelector.SearchModal.searchResults.header"
                    defaultMessage="Search results"
                  />
                </ListSubheader>
                {searchError ? (
                  <ListError>
                    <FormattedMessage
                      id="CreateGameView.PlaylistSelector.SearchModal.searchResults.error"
                      defaultMessage="Failed to search playlists."
                    />
                  </ListError>
                ) : (
                  <PlaylistList
                    selection
                    items={searchResults}
                    selectedItems={newSelection}
                    emptyText={
                      !showLoader &&
                      (query.length < minQueryLength ? (
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
                    onSelectedItemsChange={setNewSelection}
                  />
                )}
              </ListItem>
            )}
          </List>

          {showLoader && (
            <Box
              sx={{ display: "flex", justifyContent: "center", flexGrow: 1 }}
            >
              <CircularProgress thickness={5} />
            </Box>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 2,
          }}
        >
          <Typography level="body-sm" sx={{ flexGrow: 1 }}>
            <FormattedMessage
              id="CreateGameView.PlaylistSelector.SearchModal.selectionSummary"
              defaultMessage="{count, plural, =0 {No playlists} =1 {# playlist} other {# playlists}} selected"
              values={{ count: newSelection.length }}
            />
          </Typography>
          <Button variant="soft" color="neutral" onClick={handleCancel}>
            <FormattedMessage
              id="CreateGameView.PlaylistSelector.SearchModal.cancel"
              defaultMessage="Cancel"
            />
          </Button>
          <Button onClick={handleConfirm}>
            <FormattedMessage
              id="CreateGameView.PlaylistSelector.SearchModal.select"
              defaultMessage="Select"
            />
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

SearchModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  query: PropTypes.string,
  onQueryChange: PropTypes.func,
  minQueryLength: PropTypes.number,
  selection: PropTypes.arrayOf(PlaylistType),
  onSelectionChange: PropTypes.func,
  recommendationsLoading: PropTypes.bool,
  recommendationsError: ErrorType,
  recommendations: PropTypes.arrayOf(PlaylistType),
  searchLoading: PropTypes.bool,
  searchError: ErrorType,
  searchResults: PropTypes.arrayOf(PlaylistType),
};

export default SearchModal;
