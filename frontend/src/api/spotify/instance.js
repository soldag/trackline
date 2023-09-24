import axios from "axios";
import rateLimit from "axios-rate-limit";

import SpotifyError from "~/api/spotify/error";
import tracklineApi from "~/api/trackline";
import { camelizeResponse, decamelizeRequest } from "~/api/utils/interceptors";
import { Lock, sleep } from "~/utils/concurrency";
import { NetworkError } from "~/utils/errors";

export let getAccessToken = () => {};
export let setAccessToken = () => {};

export const setup = (config) => {
  ({ getAccessToken, setAccessToken } = config);
};

const refreshLock = new Lock();
const refreshAccessToken = async (refreshToken) => {
  await refreshLock.acquire();
  try {
    const accessToken = await tracklineApi.spotify.refreshAccessToken({
      refreshToken,
    });
    setAccessToken(accessToken);
    return true;
  } catch {
    return false;
  } finally {
    refreshLock.release();
  }
};

const instance = rateLimit(
  axios.create({
    baseURL: "https://api.spotify.com/v1",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
  }),
  { maxRPS: 100 },
);

instance.interceptors.request.use(decamelizeRequest);
instance.interceptors.response.use(camelizeResponse);

instance.interceptors.request.use(async (config) => {
  // Make sure to not use an expired access token by
  // waiting for a potential refresh
  await refreshLock.wait();

  const { accessToken } = getAccessToken() || {};
  if (accessToken) {
    config.accessToken = accessToken;
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

instance.interceptors.response.use(null, async (error) => {
  const { code, config, message, response } = error;
  if (code === "ERR_NETWORK") {
    throw new NetworkError(message);
  }

  if (response) {
    const { status, headers } = response;

    if (status === 401 && config.headers.Authorization) {
      const { refreshToken } = getAccessToken() || {};
      if (refreshToken && !config.retry) {
        // Refresh might have been triggered by a previous request already
        await refreshLock.wait();

        // If current access token differs from the one used in the
        // request, it was already refreshed so we can try right away.
        // Otherwise try to refresh and retry afterwards.
        const { accessToken } = getAccessToken() || {};
        if (
          config.accessToken !== accessToken ||
          (await refreshAccessToken(refreshToken))
        ) {
          return await instance.request({
            ...config,
            retry: true,
          });
        }
      }

      // Clear access token if it's invalid and cannot be refreshed
      setAccessToken(null);
    }

    if (status === 429 && headers && headers["retry-after"]) {
      const retryAfter = parseInt(headers["retry-after"], 10);
      await sleep(retryAfter * 1000);
      return await instance.request({ config });
    }

    throw new SpotifyError(message, status);
  }

  throw new Error(message);
});

export default instance;
