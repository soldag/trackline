import { BACKEND_URL } from "@/configuration";

import { getSessionToken } from "./instance";

export const getWebSocketUrl = (gameId: string): string | null => {
  const sessionToken = getSessionToken();
  if (!sessionToken) {
    return null;
  }

  const baseUrl = BACKEND_URL.replace("http", "ws");
  return `${baseUrl}/games/${gameId}/notifications?session_token=${sessionToken}`;
};
