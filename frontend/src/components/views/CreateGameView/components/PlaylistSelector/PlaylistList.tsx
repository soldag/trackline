import React from "react";
import { FormattedMessage } from "react-intl";

import CheckIcon from "@mui/icons-material/Check";
import PhotoIcon from "@mui/icons-material/Photo";
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemContent,
  Typography,
  TypographyProps,
} from "@mui/joy";

import { SpotifyPlaylist } from "@/types/spotify";

const ItemTypography = (props: TypographyProps) => (
  <Typography
    level="body-md"
    {...props}
    sx={{
      ...props.sx,
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
    }}
  />
);

interface PlaylistListProps {
  items?: SpotifyPlaylist[];
  selection?: boolean;
  selectedItems?: SpotifyPlaylist[];
  emptyText?: React.ReactNode;
  onSelectedItemsChange?: (items: SpotifyPlaylist[]) => void;
  actionIcon?: React.ReactNode;
  onAction?: (item: SpotifyPlaylist) => void;
}

const PlaylistList = ({
  items = [],
  emptyText = null,
  selection = false,
  selectedItems = [],
  onSelectedItemsChange = () => {},
  actionIcon = null,
  onAction = () => {},
}: PlaylistListProps) => {
  const selectedIds = selectedItems.map(({ id }) => id);

  const toggleSelection = (playlist: SpotifyPlaylist) => {
    if (!selection) return;

    const newSelectedItems = selectedItems.some((p) => p.id === playlist.id)
      ? selectedItems.filter(({ id }) => id != playlist.id)
      : [...selectedItems, playlist];
    onSelectedItemsChange(newSelectedItems);
  };

  return (
    <List
      sx={{
        "padding": "0px",
        "--ListItem-marginInline": "0px",
        "--ListItem-paddingY": "0px",
        "--ListItem-paddingX": "0px",
      }}
    >
      {items.map((playlist) => (
        <ListItem key={playlist.id}>
          <ListItemContent
            sx={{
              display: "flex",
              alignItems: "center",
              padding: "5px",
              ...(selection && {
                "cursor": "pointer",
                "userSelect": "none",
                "&:hover": {
                  backgroundColor: "neutral.plainHoverBg",
                },
                ...(selectedIds.includes(playlist.id) && {
                  "color": "primary.plainColor",
                  "backgroundColor": "primary.softBg",
                  "&:hover": {
                    backgroundColor: "primary.softHoverBg",
                  },
                }),
              }),
            }}
            onClick={() => toggleSelection(playlist)}
          >
            {playlist.images.length > 0 ? (
              <img
                src={playlist.images[0].url}
                style={{ width: "70px", marginRight: "0.5rem" }}
              />
            ) : (
              <PhotoIcon
                sx={{ width: "70px", height: "70px", marginRight: "0.5rem" }}
              />
            )}

            <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
              <ItemTypography level="body-md" sx={{ fontWeight: "xl" }}>
                {playlist.name}
              </ItemTypography>
              {playlist.owner && (
                <ItemTypography level="body-sm">
                  <FormattedMessage
                    id="CreateGameView.PlaylistSelector.PlaylistList.owner"
                    defaultMessage="From {owner}"
                    values={{
                      owner: playlist.owner.displayName,
                    }}
                  />
                </ItemTypography>
              )}
              <ItemTypography level="body-sm">
                <FormattedMessage
                  id="CreateGameView.PlaylistSelector.PlaylistList.tracks"
                  defaultMessage="{count} tracks"
                  values={{
                    count: playlist.tracks.total,
                  }}
                />
              </ItemTypography>
            </Box>

            {selection && selectedIds.includes(playlist.id) && <CheckIcon />}

            {actionIcon && (
              <IconButton onClick={() => onAction(playlist)}>
                {actionIcon}
              </IconButton>
            )}
          </ListItemContent>
        </ListItem>
      ))}

      {items.length === 0 && emptyText != null && (
        <Typography level="body-sm" sx={{ ml: "5px" }}>
          {emptyText}
        </Typography>
      )}
    </List>
  );
};

export default PlaylistList;
