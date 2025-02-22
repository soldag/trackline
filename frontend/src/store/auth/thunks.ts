import tracklineApi from "@/api/trackline";
import { createSafeAsyncThunk } from "@/store/utils/thunks";

import { PREFIX } from "./constants";

interface LoginPayload {
  username: string;
  password: string;
}
export const login = createSafeAsyncThunk(
  PREFIX,
  "login",
  async ({ username, password }: LoginPayload) => {
    const session = await tracklineApi.auth.login({ username, password });
    const user = await tracklineApi.users.getCurrentUser();

    return { session, user };
  },
);

export const logout = createSafeAsyncThunk(PREFIX, "logout", async () => {
  await tracklineApi.auth.logout();
});

interface CreateUserPayload {
  username: string;
  password: string;
}
export const createUser = createSafeAsyncThunk(
  PREFIX,
  "createUser",
  async ({ username, password }: CreateUserPayload) => {
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
