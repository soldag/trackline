import { SPOTIFY_CLIENT_ID } from "configuration";
import { REQUIRED_SPOTIFY_SCOPES } from "constants";

export const getAuthorizeUrl = () => {
  const redirectUrl = `${document.location.origin}/spotify/callback`;
  const state = JSON.stringify({ pathname: document.location.pathname });

  const url = new URL("https://accounts.spotify.com/authorize");
  url.searchParams.append("client_id", SPOTIFY_CLIENT_ID);
  url.searchParams.append("scope", REQUIRED_SPOTIFY_SCOPES.join(" "));
  url.searchParams.append("redirect_uri", redirectUrl);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("state", state);

  return url.toString();
};
