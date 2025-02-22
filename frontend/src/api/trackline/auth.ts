import { Session } from "@/types/auth";

import instance, { setSessionToken } from "./instance";

interface Credentials {
  username: string;
  password: string;
}

interface LoginResponse {
  data: Session;
}

export const login = async (credentials: Credentials) => {
  const {
    data: { data: session },
  } = await instance.post<LoginResponse>("auth/login", credentials);

  setSessionToken(session.token);

  return session;
};

export const logout = async () => {
  await instance.post("auth/logout");
  setSessionToken(null);
};
