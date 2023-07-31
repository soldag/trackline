import { createReducer, isAnyOf } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { resetState } from "~/store/common/actions";
import { isSuccess } from "~/store/utils/matchers";

import {
  createUser,
  fetchCurrentUser,
  invalidateSession,
  login,
  logout,
  setSessionToken,
} from "./actions";

const persistConfig = {
  key: "auth",
  storage,
  whitelist: ["sessionToken"],
};

const initialState = {
  isLoggedIn: null,
  user: null,
  sessionToken: null,
};

const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(resetState, () => ({
      ...initialState,
      isLoggedIn: false,
    }))

    .addCase(setSessionToken, (state, { payload: { token } }) => {
      if (token) {
        state.isLoggedIn = true;
        state.sessionToken = token;
      } else {
        state.isLoggedIn = false;
        state.user = null;
        state.sessionToken = null;
      }
    })

    .addCase(invalidateSession, (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.sessionToken = null;
    })

    .addMatcher(
      isAnyOf(isSuccess(login), isSuccess(createUser)),
      (state, { payload: { session, user } }) => {
        state.isLoggedIn = true;
        state.sessionToken = session.token;
        state.user = user;
      },
    )

    .addMatcher(isSuccess(fetchCurrentUser), (state, { payload: { user } }) => {
      state.isLoggedIn = true;
      state.user = user;
    })

    .addMatcher(isSuccess(logout), (state) => {
      state.isLoggedIn = false;
      state.user = null;
    });
});

export default persistReducer(persistConfig, reducer);
