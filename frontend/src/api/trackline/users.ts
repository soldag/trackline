import { User } from "@/types/users";

import instance from "./instance";
import { EntityResponse } from "./types";

export const createUser = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<User> => {
  const {
    data: { data: user },
  } = await instance.post<EntityResponse<User>>("users", {
    username,
    password,
  });
  return user;
};

export const getCurrentUser = async (): Promise<User> => {
  const {
    data: { data: user },
  } = await instance.get<EntityResponse<User>>("users/me");
  return user;
};
