import { createReducer, isAnyOf } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { dismissError, resetState } from "store/common/actions";
import {
  isFailure,
  isFulfill,
  isSuccess,
  isTrigger,
} from "store/utils/matchers";

import * as actions from "./actions";

const {
  createUser,
  fetchCurrentUser,
  login,
  logout,
  setSessionToken,
  invalidateSession,
} = actions;

const persistConfig = {
  key: "auth",
  storage,
  whitelist: ["sessionToken"],
};

const initialState = {
  loading: false,
  error: null,
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
    .addCase(dismissError, (state) => {
      state.error = null;
    })

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

    .addMatcher(isTrigger(...Object.values(actions)), (state) => {
      state.loading = true;
      state.error = null;
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
    })

    .addMatcher(
      isFailure(...Object.values(actions)),
      (state, { payload: { error } }) => {
        state.error = error;
      },
    )

    .addMatcher(isFulfill(...Object.values(actions)), (state) => {
      state.loading = false;
    });
});

export default persistReducer(persistConfig, reducer);
