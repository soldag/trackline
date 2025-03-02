import tracklineApi from "@/api/trackline";
import { createSafeAsyncThunk } from "@/store/utils/thunks";

import { PREFIX } from "./constants";

export const login = createSafeAsyncThunk(
  PREFIX,
  "login",
  async ({ username, password }) => {
    const session = await tracklineApi.auth.login({ username, password });
    const user = await tracklineApi.users.getCurrentUser();

    return { session, user };
  },
);

export const logout = createSafeAsyncThunk(PREFIX, "logout", async () => {
  await tracklineApi.auth.logout();
});

export const createUser = createSafeAsyncThunk(
  PREFIX,
  "createUser",
  async ({ username, password }) => {
    const user = await tracklineApi.users.createUser({
      username,
      password,
    });
    const session = await tracklineApi.auth.login({ username, password });

    return { user, session };
  },
);

export const fetchCurrentUser = createSafeAsyncThunk(
  PREFIX,
  "fetchCurrentUser",
  async () => {
    const user = await tracklineApi.users.getCurrentUser();
    return { user };
  },
);
