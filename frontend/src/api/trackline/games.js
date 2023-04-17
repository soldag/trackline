import instance from "./instance";

export const create = async ({ playlistIds, spotifyMarket }) => {
  const {
    data: { data: game },
  } = await instance.post("games", {
    playlistIds,
    spotifyMarket,
  });

  return game;
};

export const get = async ({ gameId }) => {
  const {
    data: { data: game },
  } = await instance.get(`games/${gameId}`);

  return game;
};

export const getUsers = async ({ gameId }) => {
  const {
    data: { data: users },
  } = await instance.get(`games/${gameId}/users`);
  return users;
};

export const join = async ({ gameId }) => {
  await instance.put(`games/${gameId}/players`);
};

export const leave = async ({ userId, gameId }) => {
  await instance.delete(`games/${gameId}/players/${userId}`);
};

export const start = async ({ gameId }) => {
  const {
    data: { data: game },
  } = await instance.post(`games/${gameId}/start`);

  return game;
};

export const abort = async ({ gameId }) => {
  await instance.post(`games/${gameId}/abort`);
};

export const createTurn = async ({ gameId }) => {
  const {
    data: { data: turn },
  } = await instance.post(`games/${gameId}/turns`);

  return turn;
};

export const createGuess = async ({
  gameId,
  turnId,
  position = null,
  releaseYear = null,
}) => {
  const {
    data: { data: guess },
  } = await instance.post(`games/${gameId}/turns/${turnId}/guess`, {
    position,
    releaseYear,
  });

  return guess;
};

export const scoreTurn = async ({ gameId, turnId }) => {
  const {
    data: { data: scoring },
  } = await instance.post(`games/${gameId}/turns/${turnId}/score`);

  return scoring;
};

export const completeTurn = async ({ gameId, turnId }) => {
  const {
    data: { data: completion },
  } = await instance.post(`games/${gameId}/turns/${turnId}/complete`);

  return completion;
};

export const buyTrack = async ({ gameId, userId }) => {
  const {
    data: { data: receipt },
  } = await instance.post(`games/${gameId}/players/${userId}/timeline`);

  return receipt;
};

export const exchangeTrack = async ({ gameId, turnId }) => {
  const {
    data: { data: track },
  } = await instance.post(`games/${gameId}/turns/${turnId}/track/exchange`);

  return track;
};