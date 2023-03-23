import instance from "./instance";

export const getAccessToken = async ({ code }) => {
  const {
    data: { data: accessToken },
  } = await instance.post("spotify/access_token", { code });

  return accessToken;
};

export const refreshAccessToken = async ({ refreshToken }) => {
  const {
    data: { data: accessToken },
  } = await instance.post("spotify/access_token/refresh", { refreshToken });

  return accessToken;
};
