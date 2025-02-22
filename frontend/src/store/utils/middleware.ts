import {
  ListenerMiddlewareInstance,
  createListenerMiddleware,
} from "@reduxjs/toolkit";

import { AppDispatch, RootState } from "@/types/store";

export const createAppListenerMiddleware = (): ListenerMiddlewareInstance<
  RootState,
  AppDispatch
> => createListenerMiddleware<RootState, AppDispatch>();
