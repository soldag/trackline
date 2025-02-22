import * as _ from "lodash-es";
import { useEffect, useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Button, Stack } from "@mui/joy";

import { AppError } from "@/types/errors";
import { SpotifyPlaylist } from "@/types/spotify";

import PlaylistList from "./PlaylistList";
import SearchModal from "./SearchModal";

const MIN_QUERY_LENGTH = 3;
const SEARCH_DEBOUNCE_INTERVAL = 300;
const SEARCH_RESULT_LIMIT = 25;

interface PlaylistSelectorProps {
  value?: SpotifyPlaylist[];
  onChange?: (value: SpotifyPlaylist[]) => void;
  loading?: boolean;
  error?: AppError;
  recommendations?: SpotifyPlaylist[];
  searchResults?: SpotifyPlaylist[];
  onSearch?: (args: { query: string; limit: number }) => void;
  onClearSearchResults?: () => void;
}

const PlaylistSelector = ({
  value = [],
  onChange = () => {},
  loading = false,
  error,
  recommendations = [],
  searchResults = [],
  onSearch = () => {},
  onClearSearchResults = () => {},
}: PlaylistSelectorProps) => {
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

  const handleUnselectPlaylist = (playlist: SpotifyPlaylist) => {
    onChange(value.filter(({ id }) => id !== playlist.id));
  };

  const handleQueryChange = (value: string) => {
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

export default PlaylistSelector;
