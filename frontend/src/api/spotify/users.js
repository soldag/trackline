import instance from "./instance";

export const getMe = async () => {
  const { data: user } = await instance.get("me");
  return user;
};
