import { camelizeKeys, decamelizeKeys } from "humps";

export const decamelizeRequest = (config) => {
  if (config.headers["Content-Type"] === "multipart/form-data") return config;

  if (config.params) {
    config.params = decamelizeKeys(config.params);
  }

  if (config.data) {
    config.data = decamelizeKeys(config.data);
  }

  return config;
};

export const camelizeResponse = (response) => {
  if (
    response.data &&
    response.headers["content-type"]?.startsWith("application/json")
  ) {
    response.data = camelizeKeys(response.data);
  }

  return response;
};