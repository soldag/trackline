import instance, { getSessionToken } from "./instance";

export const getWebSocketUrl = (gameId) => {
  const sessionToken = getSessionToken();
  if (!sessionToken) {
    return null;
  }

  const baseUrl = instance.defaults.baseURL.replace("http", "ws");
  return `${baseUrl}/games/${gameId}/notifications?session_token=${sessionToken}`;
};
