import instance from "./instance";

export const createUser = async ({ username, password }) => {
  const {
    data: { data: user },
  } = await instance.post("users", {
    username,
    password,
  });
  return user;
};

export const getCurrentUser = async () => {
  const {
    data: { data: user },
  } = await instance.get("users/me");
  return user;
};
