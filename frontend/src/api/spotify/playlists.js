import instance from "./instance";

export const get = async ({ id }) => {
  const { data: playlist } = await instance.get(`playlists/${id}`);
  return playlist;
};

export const search = async ({ query, limit, offset = 0 }) => {
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
  return items;
};
