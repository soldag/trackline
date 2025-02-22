import axios, { AxiosError } from "axios";
import rateLimit from "axios-rate-limit";

import { SpotifyApiError } from "@/api/spotify/errors";
import tracklineApi from "@/api/trackline";
import { NetworkError } from "@/api/utils/errors";
import { camelizeResponse, decamelizeRequest } from "@/api/utils/interceptors";
import { SpotifyAccessToken } from "@/types/spotify";
import { Lock, sleep } from "@/utils/concurrency";

type AccessTokenGetter = () => SpotifyAccessToken | null;
type AccessTokenSetter = (value: SpotifyAccessToken | null) => void;

export let getAccessToken: AccessTokenGetter = () => null;
export let setAccessToken: AccessTokenSetter = () => {};

export interface SpotifyApiConfig {
  getAccessToken: AccessTokenGetter;
  setAccessToken: AccessTokenSetter;
}

export const setup = (config: SpotifyApiConfig) => {
  ({ getAccessToken, setAccessToken } = config);
};

const refreshLock = new Lock();
const refreshAccessToken = async (refreshToken: string): Promise<boolean> => {
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
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return config;
});

instance.interceptors.response.use(null, async (error: AxiosError) => {
  const { code, config, message, response } = error;
  if (code === "ERR_NETWORK") {
    throw new NetworkError(message);
  }

  if (config && response) {
    const { status, headers } = response;

    if (status === 401 && config?.headers["Authorization"]) {
      const { refreshToken } = getAccessToken() || {};
      if (refreshToken && !config?.retry) {
        // Refresh might have been triggered by a previous request already
        if (!(await refreshLock.wait())) {
          await refreshAccessToken(refreshToken);
        }

        return await instance.request({
          ...config,
          retry: true,
        });
      }

      // Clear access token if it's invalid and cannot be refreshed
      setAccessToken(null);
    }

    if (status === 429 && headers && headers["retry-after"]) {
      const retryAfter = parseInt(headers["retry-after"], 10);
      await sleep(retryAfter * 1000);
      return await instance.request(config);
    }

    throw new SpotifyApiError(message, status);
  }

  throw new SpotifyApiError(message);
});

export default instance;
