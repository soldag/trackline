import instance, { setSessionToken } from "./instance";

export const login = async ({ username, password }) => {
  const {
    data: { data: session },
  } = await instance.post("auth/login", {
    username,
    password,
  });

  setSessionToken(session.token);

  return session;
};

export const logout = async () => {
  await instance.post("auth/logout");
  setSessionToken(null);
};
