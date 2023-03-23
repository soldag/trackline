const { REACT_APP_BACKEND_URL, REACT_APP_SPOTIFY_CLIENT_ID } = process.env;

// In development setup env variables are provided by the build tools and consumed at build time
// In production setup env variables are consumed at runtime by Caddy
export const BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? '<%% if env "BACKEND_URL" %%><%% env "BACKEND_URL" %%><%% end %%>' ||
      REACT_APP_BACKEND_URL
    : REACT_APP_BACKEND_URL;

export const SPOTIFY_CLIENT_ID =
  process.env.NODE_ENV === "production"
    ? '<%% if env "SPOTIFY_CLIENT_ID" %%><%% env "SPOTIFY_CLIENT_ID" %%><%% end %%>' ||
      REACT_APP_SPOTIFY_CLIENT_ID
    : REACT_APP_SPOTIFY_CLIENT_ID;
