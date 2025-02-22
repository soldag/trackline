import { SpotifyUser } from "@/types/spotify";

import instance from "./instance";

export const getMe = async (): Promise<SpotifyUser> => {
  const { data: user } = await instance.get<SpotifyUser>("me");
  return user;
};
