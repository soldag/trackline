import instance from "./instance";

export const get = async ({ id, fields }) => {
  const { data: playlist } = await instance.get(`playlists/${id}`, {
    params: {
      fields: fields?.join(","),
    },
  });
  return playlist;
};

export const search = async ({ userId, query, limit, offset = 0 }) => {
  const {
    data: {
      playlists: { items },
    },
  } = await instance.get("search", {
    params: {
      q: query,
      type: "playlist",
      limit,
      offset,
    },
  });

  // Spotify API might return null for playlists not accessible via API
  const playlists = items.filter((p) => p != null);

  // Search endpoint will always return public = null
  const privatePlaylistIds = [];
  const ownedPlaylistIds = playlists
    .filter((p) => p.owner.id === userId)
    .map((p) => p.id);
  for (const playlistId of ownedPlaylistIds) {
    const playlist = await get({ id: playlistId, fields: ["public"] });
    if (!playlist.public) {
      privatePlaylistIds.push(playlistId);
    }
  }

  return playlists.map((p) => ({
    ...p,
    public: p.public || !privatePlaylistIds.includes(p.id),
  }));
};
