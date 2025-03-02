import { createAsyncThunk } from "@reduxjs/toolkit";

export const createSafeAsyncThunk = (prefix, name, payloadCreator, options) => {
  return createAsyncThunk(
    `${prefix}/${name}`,
    async (payload, thunkApi) => {
      try {
        return await payloadCreator(payload, thunkApi);
      } catch ({ code, message, ...extra }) {
        const error = {
          code,
          message,
          extra,
        };
        return thunkApi.rejectWithValue({ error });
      }
    },
    options,
  );
};

export const getThunkTypePrefix = (action) => {
  const { type } = action;
  const index = type.lastIndexOf("/");
  return type.slice(0, index);
};
