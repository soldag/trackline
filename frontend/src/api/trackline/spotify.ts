import { SpotifyAccessToken } from "@/types/spotify";

import instance from "./instance";
import { EntityResponse } from "./types";

export const getAccessToken = async ({
  code,
}: {
  code: string;
}): Promise<SpotifyAccessToken> => {
  const {
    data: { data: accessToken },
  } = await instance.post<EntityResponse<SpotifyAccessToken>>(
    "spotify/access_token",
    { code },
  );

  return accessToken;
};

export const refreshAccessToken = async ({
  refreshToken,
}: {
  refreshToken: string;
}): Promise<SpotifyAccessToken> => {
  const {
    data: { data: accessToken },
  } = await instance.post<EntityResponse<SpotifyAccessToken>>(
    "spotify/access_token/refresh",
    { refreshToken },
  );

  return accessToken;
};
