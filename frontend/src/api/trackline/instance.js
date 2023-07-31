import axios from "axios";
import rateLimit from "axios-rate-limit";

import ApiError from "~/api/trackline/error";
import { camelizeResponse, decamelizeRequest } from "~/api/utils/interceptors";
import { BACKEND_URL } from "~/configuration";

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
    const {
      message,
      response: {
        status,
        data: { error: apiError },
      },
    } = error;

    if (status === 401 || apiError.code === "INVALID_TOKEN") {
      setSessionToken(null);
    }

    throw new ApiError(message, status, apiError);
  },
);

export default instance;
