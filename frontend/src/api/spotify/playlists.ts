import { SpotifyPlaylist } from "@/types/spotify";

import instance from "./instance";

export const get = async ({
  id,
  fields,
}: {
  id: string;
  fields?: string[];
}): Promise<SpotifyPlaylist> => {
  const { data: playlist } = await instance.get<SpotifyPlaylist>(
    `playlists/${id}`,
    {
      params: {
        fields: fields?.join(","),
      },
    },
  );
  return playlist;
};

interface SearchResponse {
  playlists: {
    items: SpotifyPlaylist[];
  };
}

export const search = async ({
  userId,
  query,
  limit,
  offset = 0,
}: {
  userId: string;
  query: string;
  limit: number;
  offset?: number;
}): Promise<SpotifyPlaylist[]> => {
  const {
    data: {
      playlists: { items },
    },
  } = await instance.get<SearchResponse>("search", {
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
  const privatePlaylistIds: string[] = [];
  const ownedPlaylistIds = playlists
    .filter((p) => p.owner?.id === userId)
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
