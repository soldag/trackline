import _ from "lodash";
import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Button, Stack } from "@mui/joy";

import { ErrorType } from "@/types/errors";
import PlaylistType from "@/types/spotify";

import PlaylistList from "./PlaylistList";
import SearchModal from "./SearchModal";

const MIN_QUERY_LENGTH = 3;
const SEARCH_DEBOUNCE_INTERVAL = 300;
const SEARCH_RESULT_LIMIT = 25;

const PlaylistSelector = ({
  value = [],
  onChange = () => {},
  loading = false,
  error = null,
  recommendations = [],
  searchResults = [],
  onSearch = () => {},
  onClearSearchResults = () => {},
}) => {
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const searchResultsToDisplay =
    query.length < MIN_QUERY_LENGTH ? [] : searchResults;

  const debouncedSearch = useMemo(
    () => _.debounce(onSearch, SEARCH_DEBOUNCE_INTERVAL),
    [onSearch],
  );
  useEffect(() => {
    if (query.length < MIN_QUERY_LENGTH) return;

    debouncedSearch({
      query,
      limit: SEARCH_RESULT_LIMIT,
    });
  }, [debouncedSearch, query]);

  const handleUnselectPlaylist = (playlist) => {
    onChange(value.filter(({ id }) => id !== playlist.id));
  };

  const handleQueryChange = (value) => {
    setQuery(value);
    if (value.length < MIN_QUERY_LENGTH && query.length >= MIN_QUERY_LENGTH) {
      onClearSearchResults();
    }
  };

  const handleCloseModal = () => {
    handleQueryChange("");
    setIsModalOpen(false);
  };

  return (
    <Stack direction="column" spacing={1} sx={{ overflow: "hidden" }}>
      <Box sx={{ overflowY: "auto" }}>
        <PlaylistList
          items={value}
          emptyText={
            <FormattedMessage
              id="CreateGameView.PlaylistSelector.emptySelection"
              defaultMessage="No playlists selected, yet."
            />
          }
          actionIcon={<DeleteIcon />}
          onAction={handleUnselectPlaylist}
        />
      </Box>

      <Button
        variant="soft"
        sx={{ alignSelf: "start" }}
        startDecorator={<AddIcon />}
        onClick={() => setIsModalOpen(true)}
      >
        <FormattedMessage
          id="CreateGameView.PlaylistSelector.addPlaylists.label"
          defaultMessage="Add playlists"
        />
      </Button>

      <SearchModal
        open={isModalOpen}
        query={query}
        selection={value}
        minQueryLength={MIN_QUERY_LENGTH}
        recommendationsLoading={loading}
        recommendationsError={error}
        recommendations={recommendations}
        searchLoading={loading}
        searchError={error}
        searchResults={searchResultsToDisplay}
        onClose={handleCloseModal}
        onQueryChange={handleQueryChange}
        onSelectionChange={onChange}
      />
    </Stack>
  );
};

PlaylistSelector.propTypes = {
  value: PropTypes.arrayOf(PlaylistType),
  onChange: PropTypes.func,
  loading: PropTypes.bool,
  error: ErrorType,
  recommendations: PropTypes.arrayOf(PlaylistType),
  searchResults: PropTypes.arrayOf(PlaylistType),
  onSearch: PropTypes.func,
  onClearSearchResults: PropTypes.func,
};

export default PlaylistSelector;
