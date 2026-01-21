import axios, { AxiosResponse } from "axios";
import rateLimit from "axios-rate-limit";
import qs from "qs";

import { TracklineApiError } from "@/api/trackline/errors";
import { ErrorResponse } from "@/api/trackline/types";
import { NetworkError, TimeoutError } from "@/api/utils/errors";
import { camelizeResponse, decamelizeRequest } from "@/api/utils/interceptors";
import { BACKEND_URL } from "@/configuration";
import { HTTP_REQUEST_TIMEOUT } from "@/constants";

type SessionTokenGetter = () => string | null;
type SessionTokenSetter = (value: string | null) => void;
type TimeDeviationSetter = (value: number) => void;

export interface TracklineApiConfig {
  getSessionToken: SessionTokenGetter;
  setSessionToken: SessionTokenSetter;
  setTimeDeviation: TimeDeviationSetter;
}

export let getSessionToken: SessionTokenGetter = () => null;
export let setSessionToken: SessionTokenSetter = () => {};
export let setTimeDeviation: TimeDeviationSetter = () => {};

export const setup = (config: TracklineApiConfig) => {
  ({ getSessionToken, setSessionToken, setTimeDeviation } = config);
};

const instance = rateLimit(
  axios.create({
    baseURL: BACKEND_URL,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: "repeat" }),
    timeout: HTTP_REQUEST_TIMEOUT,
  }),
  { maxRPS: 15 },
);

instance.interceptors.request.use(decamelizeRequest);
instance.interceptors.response.use(camelizeResponse);

instance.interceptors.request.use((config) => {
  const token = getSessionToken();
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});
instance.interceptors.response.use(
  (response) => {
    const serverTime = response.headers["x-server-time"];
    if (serverTime != null) {
      const timeDeviation = Date.now() - Date.parse(serverTime);
      setTimeDeviation(timeDeviation);
    }

    return response;
  },
  (error) => {
    const { code, message, response } = error;
    if (code === "ERR_NETWORK") {
      throw new NetworkError(message);
    } else if (code === "ECONNABORTED") {
      throw new TimeoutError(message);
    }

    if (response) {
      const {
        status,
        data: { error: apiError },
      } = response as AxiosResponse<ErrorResponse>;

      if (status === 401 || apiError.code === "INVALID_TOKEN") {
        setSessionToken(null);
      }

      throw new TracklineApiError(message, status, apiError);
    }

    throw new TracklineApiError(message);
  },
);

export default instance;
