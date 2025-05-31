/* eslint-disable no-constant-binary-expression */

const { PROD, VITE_BACKEND_URL, VITE_SENTRY_DSN, VITE_SPOTIFY_CLIENT_ID } =
  import.meta.env;

// In development setup env variables are provided by the build tools and consumed at build time
// In production setup env variables are consumed at runtime by Caddy
export const BACKEND_URL: string = PROD
  ? // @ts-expect-error Caddy template code might resolve to an empty string
    '<%% if env "BACKEND_URL" %%><%% env "BACKEND_URL" %%><%% end %%>' ||
    VITE_BACKEND_URL
  : VITE_BACKEND_URL;

export const SENTRY_DSN: string = PROD
  ? // @ts-expect-error Caddy template code might resolve to an empty string
    '<%% if env "SENTRY_DSN" %%><%% env "SENTRY_DSN" %%><%% end %%>' ||
    VITE_SENTRY_DSN
  : VITE_SENTRY_DSN;

export const SPOTIFY_CLIENT_ID: string = PROD
  ? // @ts-expect-error Caddy template code might resolve to an empty string
    '<%% if env "SPOTIFY_CLIENT_ID" %%><%% env "SPOTIFY_CLIENT_ID" %%><%% end %%>' ||
    VITE_SPOTIFY_CLIENT_ID
  : VITE_SPOTIFY_CLIENT_ID;
