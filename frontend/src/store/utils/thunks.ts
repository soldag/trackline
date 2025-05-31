import {
  Action,
  AsyncThunkOptions,
  AsyncThunkPayloadCreator,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import * as Sentry from "@sentry/react";

import { ApiError } from "@/api/utils/errors";
import { AppError, ErrorCode } from "@/types/errors";
import { AppDispatch, RootState } from "@/types/store";

type ThunkApiConfig = {
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: { error: AppError };
};

const createAppAsyncThunk = createAsyncThunk.withTypes<ThunkApiConfig>();

export const createSafeAsyncThunk = <Result, Payload = void>(
  prefix: string,
  name: string,
  payloadCreator: AsyncThunkPayloadCreator<Result, Payload, ThunkApiConfig>,
  options?: AsyncThunkOptions<Payload>,
) => {
  return createAppAsyncThunk(
    `${prefix}/${name}`,
    async (payload, thunkApi) => {
      try {
        return (await payloadCreator(payload, thunkApi)) as Result;
      } catch (e) {
        let error: AppError;
        if (e instanceof ApiError) {
          error = e.serialize();
        } else {
          error = {
            code: ErrorCode.Unexpected,
            message: "An unexpected error has occurred",
          };
        }

        if (error.code === ErrorCode.Unexpected) {
          Sentry.captureException(e);
        }

        throw thunkApi.rejectWithValue({ error });
      }
    },
    options,
  );
};

export const getThunkTypePrefix = (action: Action): string => {
  const { type } = action;
  const index = type.lastIndexOf("/");
  return type.slice(0, index);
};
