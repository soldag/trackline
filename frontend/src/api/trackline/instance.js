import axios from "axios";
import rateLimit from "axios-rate-limit";

import ApiError from "@/api/trackline/error";
import { camelizeResponse, decamelizeRequest } from "@/api/utils/interceptors";
import { BACKEND_URL } from "@/configuration";
import { HTTP_REQUEST_TIMEOUT } from "@/constants";
import { NetworkError, TimeoutError } from "@/utils/errors";

export let getSessionToken = () => {};
export let setSessionToken = () => {};
export let setTimeDeviation = () => {};

export const setup = (config) => {
  ({ getSessionToken, setSessionToken, setTimeDeviation } = config);
};

const instance = rateLimit(
  axios.create({
    baseURL: BACKEND_URL,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
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
      } = response;

      if (status === 401 || apiError.code === "INVALID_TOKEN") {
        setSessionToken(null);
      }

      throw new ApiError(message, status, apiError);
    }

    throw new Error(message);
  },
);

export default instance;
